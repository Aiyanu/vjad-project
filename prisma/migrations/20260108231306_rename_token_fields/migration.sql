/*
  Warnings:

  - You are about to drop the column `resetToken` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExp` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_resetToken_idx` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `resetToken`,
    DROP COLUMN `resetTokenExp`,
    ADD COLUMN `verificationToken` VARCHAR(191) NULL,
    ADD COLUMN `verificationTokenExp` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `User_verificationToken_idx` ON `User`(`verificationToken`);
