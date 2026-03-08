CREATE TABLE `banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`position` enum('top','mid','footer') NOT NULL DEFAULT 'mid',
	`imageUrl` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`affiliateLink` text,
	`altText` varchar(256) DEFAULT 'Publicidade',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
