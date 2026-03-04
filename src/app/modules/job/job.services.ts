import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";
import { createAndEmitNotification } from "src/helpers.ts/socketHelper.js";

const createJob = async ( payload: any) => {
  const job = await prisma.job.create({
    data: {
      ...payload,
      status: JobStatus.OPEN,
    },
  });

  // Geo matching using PostGIS
  const nearbyWorkshops = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Workshop"
    WHERE "approvalStatus" = 'APPROVED'
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(${job.longitude}, ${job.latitude}), 4326)::geography,
      ${job.radius * 1000}
    )
  `;

  const workshopIds = nearbyWorkshops.map((w) => w.id);

  // Create a single notification for all workshops
  await createAndEmitNotification({
    workshopIds, // pass array instead of single workshopId
    jobId: job.id,
    title: "New Job Nearby",
    body: "A new job is available in your area.",
  });

  return job;
};

export const JobService = {
  createJob,
};
