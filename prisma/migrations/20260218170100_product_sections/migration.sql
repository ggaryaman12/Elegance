-- Add optional section fields for product detail page
ALTER TABLE `Product` ADD COLUMN `details` TEXT NULL;
ALTER TABLE `Product` ADD COLUMN `materialsCare` TEXT NULL;
ALTER TABLE `Product` ADD COLUMN `deliveryPayment` TEXT NULL;

