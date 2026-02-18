-- Allow multiple banners with either image or video
ALTER TABLE `HomeBanner` MODIFY `imageUrl` VARCHAR(1024) NULL;
ALTER TABLE `HomeBanner` ADD COLUMN `videoUrl` VARCHAR(1024) NULL;
ALTER TABLE `HomeBanner` ADD COLUMN `videoPosterUrl` VARCHAR(1024) NULL;

