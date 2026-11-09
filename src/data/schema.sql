-- ==============================================================================
-- GREATER CHENNAI POLICE COMMISSIONER PORTAL — DATABASE SCHEMA
-- Website Maintenance Mode & Automated Restoration Alert Tables
-- ==============================================================================

-- 1. Active Maintenance Configuration Table
CREATE TABLE IF NOT EXISTS `maintenance_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `maintenance_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `maintenance_title_en` VARCHAR(255) NOT NULL DEFAULT "We'll Be Back Soon!",
  `maintenance_description_en` LONGTEXT NULL,
  `maintenance_title_ta` VARCHAR(255) NOT NULL DEFAULT 'இணையதளம் பராமரிப்பில் உள்ளது',
  `maintenance_description_ta` LONGTEXT NULL,
  `expected_restoration_datetime` VARCHAR(64) NULL,
  `expected_restore_at` VARCHAR(64) NULL,
  `maintenance_message_en` LONGTEXT NULL,
  `maintenance_message_ta` LONGTEXT NULL,
  `active_schedule_ref` VARCHAR(128) NULL,
  `updated_by` VARCHAR(128) NOT NULL DEFAULT 'System',
  `updated_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial default row
INSERT INTO `maintenance_config` (
  `id`, `maintenance_enabled`, `maintenance_title_en`, `maintenance_description_en`,
  `maintenance_title_ta`, `maintenance_description_ta`, `expected_restoration_datetime`,
  `expected_restore_at`, `maintenance_message_en`, `maintenance_message_ta`,
  `active_schedule_ref`, `updated_by`, `updated_at`
) VALUES (
  1, 0, "We'll Be Back Soon!",
  "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
  "இணையதளம் பராமரிப்பில் உள்ளது",
  "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
  NULL, NULL,
  "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
  "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
  NULL, "System", NOW()
) ON DUPLICATE KEY UPDATE `id` = 1;

-- 2. Maintenance Restoration Alert Notifications History Table
CREATE TABLE IF NOT EXISTS `maintenance_notifications` (
  `id` VARCHAR(128) NOT NULL,
  `schedule_ref` VARCHAR(128) NOT NULL,
  `scheduled_restoration_datetime` VARCHAR(64) NOT NULL,
  `generated_at` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'NEW',
  `read_by` VARCHAR(128) NULL,
  `read_at` VARCHAR(64) NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `maintenance_status_at_trigger` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  INDEX `idx_maint_schedule_ref` (`schedule_ref`),
  INDEX `idx_maint_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
