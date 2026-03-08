CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`icon` varchar(64),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `generationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('message','horoscope','image') NOT NULL,
	`status` enum('success','error') NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `horoscopes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sign` enum('aries','touro','gemeos','cancer','leao','virgem','libra','escorpiao','sagitario','capricornio','aquario','peixes') NOT NULL,
	`date` date NOT NULL,
	`text` text NOT NULL,
	`loveText` text,
	`workText` text,
	`energyText` text,
	`imageUrl` text,
	`slug` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `horoscopes_id` PRIMARY KEY(`id`),
	CONSTRAINT `horoscopes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`text` text NOT NULL,
	`imageUrl` text,
	`slug` varchar(256) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `messages_slug_unique` UNIQUE(`slug`)
);
