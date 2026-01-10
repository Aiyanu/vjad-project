/*
  Warnings:

  - You are about to drop the column `accountName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `bankCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `referrerId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_referrerId_fkey`;

-- DropIndex
DROP INDEX `User_referralCode_key` ON `user`;

-- DropIndex
DROP INDEX `User_referrerId_idx` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `accountName`,
    DROP COLUMN `accountNumber`,
    DROP COLUMN `bankCode`,
    DROP COLUMN `bankName`,
    DROP COLUMN `referralCode`,
    DROP COLUMN `referrerId`;

-- CreateTable
CREATE TABLE `Affiliate` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NULL,
    `bankCode` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NULL,
    `referralCode` VARCHAR(191) NULL,
    `referrerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Affiliate_userId_key`(`userId`),
    UNIQUE INDEX `Affiliate_referralCode_key`(`referralCode`),
    INDEX `Affiliate_referrerId_idx`(`referrerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Affiliate` ADD CONSTRAINT `Affiliate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Affiliate` ADD CONSTRAINT `Affiliate_referrerId_fkey` FOREIGN KEY (`referrerId`) REFERENCES `Affiliate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
