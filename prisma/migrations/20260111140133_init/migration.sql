-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `role` ENUM('affiliate', 'admin', 'super_admin') NOT NULL DEFAULT 'affiliate',
    `phone` VARCHAR(191) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationToken` VARCHAR(191) NULL,
    `verificationTokenExp` DATETIME(3) NULL,
    `isDisabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_verificationToken_idx`(`verificationToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
