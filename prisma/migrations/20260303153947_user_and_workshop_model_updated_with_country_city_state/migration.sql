-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "country" TEXT,
ADD COLUMN     "state" TEXT,
ALTER COLUMN "address" DROP NOT NULL;
