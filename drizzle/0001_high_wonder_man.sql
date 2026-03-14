CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`amount` float NOT NULL,
	`type` enum('subscription','extra_video') NOT NULL,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`plan` varchar(50),
	`wooviChargeId` varchar(200) NOT NULL,
	`wooviQrCode` text,
	`wooviQrCodeText` text,
	`paidAt` timestamp,
	`idempotencyKey` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_wooviChargeId_unique` UNIQUE(`wooviChargeId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('basico','profissional','agencia') NOT NULL,
	`status` enum('active','pending','expired','cancelled') NOT NULL DEFAULT 'pending',
	`videosLimit` int NOT NULL,
	`videosUsed` int NOT NULL DEFAULT 0,
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`wooviSubscriptionId` varchar(200),
	`wooviCustomerId` varchar(200),
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`propertyType` enum('apartamento','casa','comercial','terreno') NOT NULL,
	`videoStyle` enum('Moderno','Luxo','Aconchegante','Minimalista','Classico') NOT NULL,
	`specialHighlight` text,
	`status` enum('pending','processing','analyzing','generating','composing','ready','expired','error') NOT NULL DEFAULT 'pending',
	`progress` int NOT NULL DEFAULT 0,
	`photosCount` int NOT NULL,
	`photosUrls` json NOT NULL,
	`clipsUrls` json,
	`promptsJson` json,
	`finalVideoUrl` text,
	`finalVideoKey` text,
	`errorMessage` text,
	`musicTrack` varchar(100),
	`expiresAt` timestamp NOT NULL,
	`notifiedReady` boolean NOT NULL DEFAULT false,
	`notifiedExpiring` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(200) NOT NULL,
	`source` varchar(50) NOT NULL,
	`type` varchar(100) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhookEvents_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `image` text;--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('corretor','imobiliaria') DEFAULT 'corretor' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creci` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `companyName` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;