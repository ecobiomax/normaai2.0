CREATE TABLE `affiliate_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('shopee','mercadolivre') NOT NULL,
	`url` text NOT NULL,
	`title` varchar(255),
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`validFrom` date,
	`validUntil` date,
	`clickCount` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`totalCommission` decimal(12,2) NOT NULL,
	`distributedAmount` decimal(12,2) NOT NULL,
	`retainedAmount` decimal(12,2) NOT NULL,
	`totalSharesAtTime` int NOT NULL,
	`activeShareholdersAtTime` int NOT NULL,
	`notes` text,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `daily_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earning_credited','share_purchase_confirmed','withdrawal_approved','withdrawal_processed','withdrawal_failed','new_affiliate_link','system_message','admin_new_purchase','admin_withdrawal_request') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `shareholder_earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dailyEarningId` int NOT NULL,
	`date` date NOT NULL,
	`sharesAtTime` int NOT NULL,
	`percentageAtTime` decimal(10,6) NOT NULL,
	`amount` decimal(12,4) NOT NULL,
	`amountCents` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shareholder_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shares_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quantity` int NOT NULL,
	`pricePerShare` decimal(10,2) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`wooviChargeId` varchar(255),
	`wooviCorrelationId` varchar(255),
	`pixQrCode` text,
	`pixCopyPaste` text,
	`status` enum('pending','paid','expired','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`lockUntil` timestamp,
	`canSell` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shares_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`amountCents` bigint NOT NULL,
	`pixKey` varchar(255) NOT NULL,
	`pixKeyType` varchar(20) NOT NULL,
	`wooviPaymentId` varchar(255),
	`wooviCorrelationId` varchar(255),
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`failureReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `fullName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `pixKey` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `pixKeyType` enum('cpf','email','phone','random');--> statement-breakpoint
ALTER TABLE `users` ADD `profileComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `availableBalance` bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalEarned` bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalShares` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `joinedWhatsapp` boolean DEFAULT false NOT NULL;