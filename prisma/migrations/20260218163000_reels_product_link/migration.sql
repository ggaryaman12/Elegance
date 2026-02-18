-- Add optional product link for reels
ALTER TABLE `Reel` ADD COLUMN `productId` CHAR(36) NULL;

-- Index for filtering/sorting
CREATE INDEX `Reel_productId_createdAt_idx` ON `Reel`(`productId`, `createdAt`);

-- Foreign key (optional)
ALTER TABLE `Reel`
  ADD CONSTRAINT `Reel_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

