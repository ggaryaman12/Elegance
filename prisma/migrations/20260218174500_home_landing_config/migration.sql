-- Home landing config: announcements + banner, and sponsored products

CREATE TABLE `Announcement` (
  `id` CHAR(36) NOT NULL,
  `message` VARCHAR(180) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Announcement_isActive_sortOrder_idx` (`isActive`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `HomeBanner` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `subtitle` VARCHAR(240) NOT NULL,
  `imageUrl` VARCHAR(1024) NOT NULL,
  `ctaText` VARCHAR(60) NOT NULL,
  `ctaHref` VARCHAR(200) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `HomeBanner_isActive_sortOrder_idx` (`isActive`, `sortOrder`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
