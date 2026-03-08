import { describe, expect, it } from "vitest";

describe("OpenAI API Key validation", () => {
  it("OPENAI_API_KEY is defined in environment", () => {
    const key = process.env.OPENAI_API_KEY;
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(10);
    expect(key!.startsWith("sk-")).toBe(true);
  });

  it("can call OpenAI chat completions API", async () => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Diga apenas: OK" }],
        max_tokens: 5,
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json() as any;
    expect(data.choices).toBeDefined();
    expect(data.choices.length).toBeGreaterThan(0);
    console.log("[OpenAI Test] Response:", data.choices[0]?.message?.content);
  }, 15000);
});
