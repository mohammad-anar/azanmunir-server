/*
  Warnings:

  - Added the required column `cvrNumber` to the `Workshop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "cvrNumber" TEXT NOT NULL,
ADD COLUMN     "ownerName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WorkshopOpeningHour" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkshopOpeningHour_workshopId_day_key" ON "WorkshopOpeningHour"("workshopId", "day");

-- AddForeignKey
ALTER TABLE "WorkshopOpeningHour" ADD CONSTRAINT "WorkshopOpeningHour_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
