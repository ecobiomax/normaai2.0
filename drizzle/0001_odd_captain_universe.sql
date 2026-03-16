CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`resourceType` varchar(64),
	`resourceId` varchar(128),
	`ipAddress` varchar(64),
	`userAgent` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `billing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int NOT NULL,
	`planId` int NOT NULL,
	`amountBrl` decimal(10,2) NOT NULL,
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`wooviChargeId` varchar(128),
	`pixCode` text,
	`pixQrCode` text,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(32) NOT NULL,
	`name` varchar(64) NOT NULL,
	`priceBrl` decimal(10,2) NOT NULL,
	`videosPerMonth` int NOT NULL,
	`maxDurationSec` int NOT NULL,
	`maxVoiceProfiles` int NOT NULL,
	`quality` varchar(32) NOT NULL,
	`storageDays` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('pending','active','cancelled','expired','failed') NOT NULL DEFAULT 'pending',
	`wooviSubscriptionId` varchar(128),
	`wooviChargeId` varchar(128),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`creditsRemaining` int NOT NULL DEFAULT 0,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `terms_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(64),
	`userAgent` text,
	`termsVersion` varchar(16) NOT NULL DEFAULT '1.0',
	CONSTRAINT `terms_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`voiceProfileId` int NOT NULL,
	`photoS3Url` text,
	`photoS3Key` varchar(512),
	`promptText` text NOT NULL,
	`language` varchar(8) NOT NULL DEFAULT 'pt-BR',
	`status` enum('pending','tts_processing','tts_done','lipsync_processing','lipsync_done','watermark_processing','completed','failed') NOT NULL DEFAULT 'pending',
	`didJobId` varchar(256),
	`audioS3Url` text,
	`audioS3Key` varchar(512),
	`outputS3Url` text,
	`outputS3Key` varchar(512),
	`durationSec` int,
	`planQuality` varchar(32),
	`errorMessage` text,
	`notifyByEmail` boolean NOT NULL DEFAULT false,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`elevenLabsVoiceId` varchar(128),
	`audioS3Url` text,
	`audioS3Key` varchar(512),
	`status` enum('processing','ready','failed') NOT NULL DEFAULT 'processing',
	`durationSec` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voice_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `termsAccepted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `termsAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `termsVersion` varchar(16) DEFAULT '1.0';--> statement-breakpoint
ALTER TABLE `users` ADD `termsIp` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `termsUserAgent` text;--> statement-breakpoint
ALTER TABLE `users` ADD `planId` int;