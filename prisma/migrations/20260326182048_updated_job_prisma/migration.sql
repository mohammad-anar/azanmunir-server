-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "isBestValue" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "bookingId" DROP NOT NULL;
