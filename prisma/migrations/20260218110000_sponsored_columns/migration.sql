-- Ensure sponsored columns exist before sponsored index migration.
-- Use conditional DDL to be compatible across MySQL/TiDB variants.

SET @schema := DATABASE();

SET @col1 := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema AND TABLE_NAME = 'Product' AND COLUMN_NAME = 'isSponsored'
);
SET @sql1 := IF(
  @col1 = 0,
  'ALTER TABLE `Product` ADD COLUMN `isSponsored` BOOLEAN NOT NULL DEFAULT false',
  'SELECT 1'
);
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @col2 := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema AND TABLE_NAME = 'Product' AND COLUMN_NAME = 'sponsoredSortOrder'
);
SET @sql2 := IF(
  @col2 = 0,
  'ALTER TABLE `Product` ADD COLUMN `sponsoredSortOrder` INTEGER NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
