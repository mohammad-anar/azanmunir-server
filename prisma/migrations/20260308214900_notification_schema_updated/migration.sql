/*
  Warnings:

  - You are about to drop the column `userIds` on the `ChatNotification` table. All the data in the column will be lost.
  - You are about to drop the column `userIds` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `workshopIds` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatNotification" DROP COLUMN "userIds";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userIds",
DROP COLUMN "workshopIds",
ADD COLUMN     "receiverUserId" TEXT,
ADD COLUMN     "receiverWorkshopId" TEXT;
