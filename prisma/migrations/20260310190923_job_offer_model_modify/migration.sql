/*
  Warnings:

  - A unique constraint covering the columns `[jobId,workshopId]` on the table `JobOffer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_jobId_workshopId_key" ON "JobOffer"("jobId", "workshopId");
