/*
  Warnings:

  - You are about to drop the column `content` on the `Blog` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readTime` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTitle` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "content",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "readTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "subTitle" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BlogContent" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "BlogContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogContent" ADD CONSTRAINT "BlogContent_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
