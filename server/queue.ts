import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import type { Message } from "./_core/llm";
import { updateVideo, getVideoById, getUserById, getSubscriptionByUserId, incrementVideosUsed } from "./db";
import { storagePut, storageGet } from "./storage";
import { invokeLLM } from "./_core/llm";
import { sendVideoReadyEmail } from "./email";
import { broadcastVideoProgress } from "./websocket";
import path from "path";
import fs from "fs";
import os from "os";
import https from "https";
import http from "http";

// ─── Redis connection ─────────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let connection: IORedis | null = null;

function getRedisConnection(): IORedis {
  if (!connection) {
    try {
      connection = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      connection.on("error", (err) => {
        console.warn("[Redis] Connection error:", err.message);
      });
    } catch (err) {
      console.warn("[Redis] Failed to create connection:", err);
    }
  }
  return connection!;
}

// ─── Queue ────────────────────────────────────────────────────────────────────
export let videoQueue: Queue;

try {
  videoQueue = new Queue("video-generation", {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });
} catch (err) {
  console.warn("[Queue] Failed to create queue, using mock:", err);
  // Mock queue for environments without Redis
  videoQueue = {
    add: async (name: string, data: any) => {
      console.log(`[Queue Mock] Job added: ${name}`, data);
      // Process immediately in mock mode
      setTimeout(() => processVideoJobMock(data), 100);
      return { id: Date.now().toString() } as any;
    },
  } as any;
}

// ─── Helper: download file ────────────────────────────────────────────────────
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// ─── Helper: analyze photos with LLM ─────────────────────────────────────────
async function analyzePhotos(
  photosUrls: string[],
  videoStyle: string,
  propertyType: string,
  title: string,
  specialHighlight?: string
): Promise<Array<{ foto_index: number; prompt: string; camera_movement: string }>> {
  const systemPrompt = `You are an expert cinematographer and real estate marketing specialist.
Analyze each property photo and generate an optimized prompt for Runway Gen-4 Turbo API.
For each photo, specify:
- Camera movement type: slow pan left/right, dolly forward/backward, tilt up/down, orbit, zoom in/out, tracking shot
- Speed: slow or medium
- Atmosphere matching the style: ${videoStyle}
- Duration: 5 seconds

Video style guidelines:
- Moderno: dynamic movements, quick pans, modern feel, cool lighting
- Luxo: slow elegant movements, golden hour, luxury atmosphere, warm tones
- Aconchegante: gentle movements, warm lighting, cozy family atmosphere
- Minimalista: clean compositions, subtle movements, architectural focus
- Classico: traditional camera movements, professional real estate feel

Property: ${title} (${propertyType})
${specialHighlight ? `Special highlight: ${specialHighlight}` : ""}

Return a JSON array with objects: {foto_index, prompt, camera_movement}
Make each prompt unique and cinematically compelling.`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: [
        { type: "text" as const, text: `Analyze these ${photosUrls.length} property photos and generate cinematographic prompts:` },
        ...photosUrls.map((url) => ({
          type: "image_url" as const,
          image_url: { url, detail: "low" as const },
        })),
      ],
    },
  ];

  const response = await invokeLLM({
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "photo_prompts",
        strict: true,
        schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  foto_index: { type: "integer" },
                  prompt: { type: "string" },
                  camera_movement: { type: "string" },
                },
                required: ["foto_index", "prompt", "camera_movement"],
                additionalProperties: false,
              },
            },
          },
          required: ["prompts"],
          additionalProperties: false,
        },
      },
    },
  });

   const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) throw new Error("No response from LLM");
  const contentStr = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
  const parsed = JSON.parse(contentStr);
  return parsed.prompts;
}

// ─── Helper: generate clip with Runway ───────────────────────────────────────
async function generateRunwayClip(
  imageUrl: string,
  prompt: string,
  runwayApiKey: string
): Promise<string> {
  const axios = (await import("axios")).default;

  // Create task
  const createRes = await axios.post(
    "https://api.dev.runwayml.com/v1/image_to_video",
    {
      model: "gen4_turbo",
      promptImage: imageUrl,
      promptText: prompt,
      duration: 5,
      ratio: "1280:720",
    },
    {
      headers: {
        Authorization: `Bearer ${runwayApiKey}`,
        "X-Runway-Version": "2024-11-06",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const taskId = createRes.data.id;
  if (!taskId) throw new Error("No task ID from Runway");

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 100; // 5 minutes max
  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await axios.get(
      `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${runwayApiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const task = statusRes.data;
    if (task.status === "SUCCEEDED") {
      return task.output?.[0];
    } else if (task.status === "FAILED") {
      throw new Error(`Runway task failed: ${task.failure || "Unknown error"}`);
    }
    attempts++;
  }
  throw new Error("Runway task timed out");
}

// ─── Helper: compose video with FFmpeg ───────────────────────────────────────
async function composeVideo(
  clipPaths: string[],
  musicTrack: string,
  outputPath: string
): Promise<void> {
  const { default: ffmpeg } = await import("fluent-ffmpeg");

  return new Promise((resolve, reject) => {
    const tmpDir = path.dirname(outputPath);
    const concatListPath = path.join(tmpDir, "concat_list.txt");

    // Create concat list with crossfade transitions
    // Using filter_complex for crossfade
    const listContent = clipPaths.map((p) => `file '${p}'`).join("\n");
    fs.writeFileSync(concatListPath, listContent);

    // Build filter_complex for crossfade between clips
    const crossfadeDuration = 0.5;
    const clipDuration = 5;

    let filterComplex = "";
    let inputArgs: string[] = [];

    clipPaths.forEach((clipPath, i) => {
      inputArgs.push("-i", clipPath);
    });

    // Music path
    const musicDir = path.join(process.cwd(), "server", "music");
    const musicPath = path.join(musicDir, musicTrack);
    const hasMusicFile = fs.existsSync(musicPath);

    if (hasMusicFile) {
      inputArgs.push("-i", musicPath);
    }

    const cmd = ffmpeg();

    // Add all clip inputs
    clipPaths.forEach((clipPath) => {
      cmd.input(clipPath);
    });

    if (hasMusicFile) {
      cmd.input(musicPath);
    }

    // Build filter for crossfade
    if (clipPaths.length === 1) {
      // Single clip: just add fade in/out
      cmd
        .videoFilters([
          "fade=t=in:st=0:d=0.5",
          `fade=t=out:st=${clipDuration - 0.5}:d=0.5`,
        ])
        .output(outputPath)
        .outputOptions(["-c:v libx264", "-preset fast", "-crf 18", "-r 30", "-s 1920x1080"])
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    } else {
      // Multiple clips with crossfade using concat demuxer
      const concatFilter = `concat=n=${clipPaths.length}:v=1:a=0[outv]`;

      let filterStr = "";
      clipPaths.forEach((_, i) => {
        filterStr += `[${i}:v]`;
      });
      filterStr += `concat=n=${clipPaths.length}:v=1:a=0,fade=t=in:st=0:d=0.5,fade=t=out:st=${clipPaths.length * clipDuration - 0.5}:d=0.5[outv]`;

      const outputOptions = [
        "-map [outv]",
        "-c:v libx264",
        "-preset fast",
        "-crf 18",
        "-r 30",
        "-s 1920x1080",
        "-pix_fmt yuv420p",
      ];

      if (hasMusicFile) {
        const musicInputIdx = clipPaths.length;
        filterStr += `;[${musicInputIdx}:a]volume=0.15,afade=t=in:st=0:d=1,afade=t=out:st=${clipPaths.length * clipDuration - 1}:d=1[outa]`;
        outputOptions.push("-map [outa]", "-c:a aac", "-b:a 128k");
      }

      cmd
        .complexFilter(filterStr)
        .outputOptions(outputOptions)
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", reject)
        .run();
    }
  });
}

// ─── Mock processor (when Redis/Runway not available) ─────────────────────────
async function processVideoJobMock(data: any) {
  const { videoId } = data;
  try {
    await updateVideo(videoId, { status: "analyzing", progress: 10 });
    broadcastVideoProgress(videoId, { status: "analyzing", progress: 10 });

    await new Promise((r) => setTimeout(r, 2000));
    await updateVideo(videoId, { status: "generating", progress: 40 });
    broadcastVideoProgress(videoId, { status: "generating", progress: 40 });

    await new Promise((r) => setTimeout(r, 2000));
    await updateVideo(videoId, { status: "composing", progress: 80 });
    broadcastVideoProgress(videoId, { status: "composing", progress: 80 });

    await new Promise((r) => setTimeout(r, 1000));
    await updateVideo(videoId, {
      status: "ready",
      progress: 100,
      finalVideoUrl: "https://example.com/sample-video.mp4",
      finalVideoKey: `videos/${videoId}/final.mp4`,
    });
    broadcastVideoProgress(videoId, { status: "ready", progress: 100 });
  } catch (err) {
    console.error("[Queue Mock] Error:", err);
    await updateVideo(videoId, { status: "error", errorMessage: String(err) });
    broadcastVideoProgress(videoId, { status: "error", progress: 0 });
  }
}

// ─── Worker ───────────────────────────────────────────────────────────────────
let worker: Worker | null = null;

export function startVideoWorker() {
  const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

  try {
    worker = new Worker(
      "video-generation",
      async (job: Job) => {
        const {
          videoId,
          userId,
          photosUrls,
          videoStyle,
          propertyType,
          title,
          specialHighlight,
          musicTrack,
        } = job.data;

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pluuu-"));

        try {
          // Step 1: Analyze photos
          await updateVideo(videoId, { status: "analyzing", progress: 10 });
          broadcastVideoProgress(videoId, { status: "analyzing", progress: 10 });

          const prompts = await analyzePhotos(
            photosUrls,
            videoStyle,
            propertyType,
            title,
            specialHighlight
          );

          await updateVideo(videoId, { promptsJson: prompts as any, progress: 25 });

          // Step 2: Generate clips
          await updateVideo(videoId, { status: "generating", progress: 30 });
          broadcastVideoProgress(videoId, { status: "generating", progress: 30 });

          const clipPaths: string[] = [];
          const clipUrls: string[] = [];

          if (RUNWAY_API_KEY) {
            for (let i = 0; i < photosUrls.length; i++) {
              const photoUrl = photosUrls[i];
              const promptData = prompts[i] || prompts[0];

              const clipUrl = await generateRunwayClip(
                photoUrl,
                promptData.prompt,
                RUNWAY_API_KEY
              );

              // Download clip
              const clipPath = path.join(tmpDir, `clip_${i}.mp4`);
              await downloadFile(clipUrl, clipPath);
              clipPaths.push(clipPath);

              // Upload to S3
              const clipBuffer = fs.readFileSync(clipPath);
              const { url: s3ClipUrl } = await storagePut(
                `clips/${videoId}/clip_${i}.mp4`,
                clipBuffer,
                "video/mp4"
              );
              clipUrls.push(s3ClipUrl);

              const progress = 30 + Math.round((i + 1) / photosUrls.length * 40);
              await updateVideo(videoId, { progress, clipsUrls: clipUrls as any });
              broadcastVideoProgress(videoId, { status: "generating", progress });
            }
          } else {
            // Demo mode: use placeholder clips
            console.warn("[Worker] RUNWAY_API_KEY not set, using demo mode");
            for (let i = 0; i < photosUrls.length; i++) {
              clipUrls.push(photosUrls[i]);
              clipPaths.push(""); // Will be skipped in compose
            }
          }

          // Step 3: Compose final video
          await updateVideo(videoId, { status: "composing", progress: 75 });
          broadcastVideoProgress(videoId, { status: "composing", progress: 75 });

          let finalVideoUrl = "";
          let finalVideoKey = "";

          if (RUNWAY_API_KEY && clipPaths.every((p) => p && fs.existsSync(p))) {
            const outputPath = path.join(tmpDir, "final.mp4");
            await composeVideo(clipPaths, musicTrack || "track_modern.mp3", outputPath);

            const videoBuffer = fs.readFileSync(outputPath);
            finalVideoKey = `videos/${videoId}/final.mp4`;
            const { url } = await storagePut(finalVideoKey, videoBuffer, "video/mp4");
            finalVideoUrl = url;
          } else {
            // Demo: use first photo as placeholder
            finalVideoUrl = photosUrls[0] || "";
            finalVideoKey = `videos/${videoId}/final.mp4`;
          }

          // Step 4: Mark as ready
          await updateVideo(videoId, {
            status: "ready",
            progress: 100,
            finalVideoUrl,
            finalVideoKey,
            clipsUrls: clipUrls as any,
          });
          broadcastVideoProgress(videoId, { status: "ready", progress: 100 });

          // Send email notification
          const user = await getUserById(userId);
          if (user?.email) {
            const video = await getVideoById(videoId);
            await sendVideoReadyEmail(user.email, user.name || "Corretor", {
              title: title,
              downloadUrl: finalVideoUrl,
              expiresAt: video?.expiresAt || new Date(),
            });
          }
        } finally {
          // Cleanup temp files
          try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          } catch {}
        }
      },
      {
        connection: getRedisConnection(),
        concurrency: 2,
      }
    );

    worker.on("failed", async (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed:`, err);
      if (job?.data?.videoId) {
        await updateVideo(job.data.videoId, {
          status: "error",
          errorMessage: err.message,
        });
        broadcastVideoProgress(job.data.videoId, { status: "error", progress: 0 });
      }
    });

    console.log("[Worker] Video generation worker started");
  } catch (err) {
    console.warn("[Worker] Failed to start worker (Redis may not be available):", err);
  }
}
