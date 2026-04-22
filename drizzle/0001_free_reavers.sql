CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`sourceUrl` text,
	`sourcePlatform` varchar(64),
	`title` varchar(500) NOT NULL,
	`materials` json,
	`durationMinutes` int,
	`ageMin` int,
	`ageMax` int,
	`skills` json,
	`steps` json,
	`safetyNotes` json,
	`messiness` int,
	`indoorOutdoor` varchar(16),
	`scheduledFor` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`dob` date NOT NULL,
	`gender` varchar(32),
	`photoUrl` text,
	`allergies` json,
	`medications` json,
	`schoolName` varchar(255),
	`teacherName` varchar(255),
	`pediatricianName` varchar(255),
	`pediatricianPhone` varchar(64),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`bookTitle` varchar(255) NOT NULL,
	`bookAuthor` varchar(255) NOT NULL,
	`topic` varchar(128) NOT NULL,
	`ageBucket` varchar(16) NOT NULL,
	`embedding` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`messages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`startTime` timestamp,
	`endTime` timestamp,
	`location` text,
	`sourceType` varchar(32),
	`sourceLabel` varchar(255),
	`actionItems` json,
	`amountDue` json,
	`confidence` decimal(3,2),
	`rawContent` text,
	`replyDraft` text,
	`fileUrl` text,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `growth_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`recordDate` date NOT NULL,
	`ageMonths` int NOT NULL,
	`weightLbs` decimal(5,1),
	`heightIn` decimal(5,1),
	`weightPercentile` int,
	`heightPercentile` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `growth_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`childId` int NOT NULL,
	`visitDate` date NOT NULL,
	`type` varchar(64) NOT NULL,
	`fileUrl` text,
	`extracted` json,
	`summary` text,
	`nextAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_records_id` PRIMARY KEY(`id`)
);
