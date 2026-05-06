-- CreateEnum
CREATE TYPE "RoomTag" AS ENUM ('ONGOING', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_bookingId_fkey";

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "tag" "RoomTag" NOT NULL DEFAULT 'ONGOING';

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
