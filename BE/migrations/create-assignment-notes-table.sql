-- Create assignment_notes table
-- Run this migration if the assignment_notes table doesn't exist

CREATE TABLE IF NOT EXISTS `assignment_notes` (
  `id` VARCHAR(191) NOT NULL,
  `assignment_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `file_url` VARCHAR(191) NOT NULL,
  `file_name` VARCHAR(191) NOT NULL,
  `file_size` INT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `assignment_notes_assignment_id_idx` (`assignment_id`),
  INDEX `assignment_notes_user_id_idx` (`user_id`),
  CONSTRAINT `assignment_notes_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assignment_notes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
