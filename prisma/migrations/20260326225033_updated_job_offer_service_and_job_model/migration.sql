-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "workshopIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
