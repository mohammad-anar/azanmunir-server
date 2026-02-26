/*
  Warnings:

  - Added the required column `estimatedTime` to the `JobOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "estimatedTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "message" TEXT;
