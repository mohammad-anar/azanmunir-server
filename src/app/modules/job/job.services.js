import { JobStatus } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import { createAndEmitNotification } from "src/helpers.ts/socketHelper.js";
// const createJob = async (userId: string, payload: any) => {
//   const { categories, ...jobData } = payload;
//   // 1️⃣ Create Job
//   const job = await prisma.job.create({
//     data: {
//       ...jobData,
//       userId,
//       status: JobStatus.OPEN,
//     },
//   });
//   // 2️⃣ Create Job Categories
//   if (categories && categories.length > 0) {
//     await prisma.jobCategory.createMany({
//       data: categories?.map((cat: any) => ({
//         jobId: job.id,
//         categoryId: cat.categoryId,
//         description: cat.description,
//       })),
//     });
//   }
//   // 3️⃣ Find Nearby Workshops (PostGIS)
//   const nearbyWorkshops = await prisma.$queryRaw<{ id: string }[]>`
//     SELECT id FROM "Workshop"
//     WHERE "approvalStatus" = 'APPROVED'
//     AND ST_DWithin(
//       ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
//       ST_SetSRID(ST_MakePoint(${job.longitude}, ${job.latitude}), 4326)::geography,
//       ${job.radius * 1000}
//     )
//   `;
//   const workshopIds = nearbyWorkshops.map((w) => w.id);
//   // 4️⃣ Send Notifications via Socket
//   if (workshopIds.length > 0) {
//     await createAndEmitNotification({
//       workshopIds,
//       jobId: job.id,
//       title: "New Job Nearby",
//       body: "A new bike service job is available in your area.",
//       eventType: "NEW_JOB_POSTED",
//     });
//   }
//   return job;
// };
const createJob = async (userId, payload) => {
    const { categories, ...jobData } = payload;
    return await prisma.$transaction(async (tx) => {
        // 1️⃣ Create Job
        const job = await tx.job.create({
            data: {
                ...jobData,
                userId,
                status: JobStatus.OPEN,
            },
        });
        // 2️⃣ Create Job Categories
        if (categories && categories.length > 0) {
            await tx.jobCategory.createMany({
                data: categories.map((cat) => ({
                    jobId: job.id,
                    categoryId: cat.categoryId,
                    description: cat.description,
                })),
            });
        }
        // 3️⃣ Find Nearby Workshops (PostGIS)
        const nearbyWorkshops = await tx.$queryRaw `
      SELECT id FROM "Workshop"
      WHERE "approvalStatus" = 'APPROVED'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${job.longitude}, ${job.latitude}), 4326)::geography,
        ${job.radius * 1000}
      )
    `;
        const workshopIds = nearbyWorkshops.map((w) => w.id);
        // 4️⃣ Send Notifications via Socket
        if (workshopIds.length > 0) {
            await createAndEmitNotification({
                workshopIds,
                jobId: job.id,
                title: "New Job Nearby",
                body: "A new bike service job is available in your area.",
                eventType: "NEW_JOB_POSTED",
            });
        }
        return job;
    });
};
const getAllJobs = async (filter, options) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filter;
    const andConditions = [];
    if (filter.searchTerm) {
        andConditions.push({
            OR: ["title", "description"].map((field) => ({
                [field]: {
                    contains: filter.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = { AND: andConditions };
    const result = await prisma.job.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : {
                createdAt: "desc",
            },
        select: {
            id: true,
            title: true,
            description: true,
            address: true,
            bikeName: true,
            bikeType: true,
            bikeBrand: true,
            bikeId: true,
            bike: true,
            city: true,
            categories: {
                select: {
                    description: true,
                    category: true,
                },
            },
            latitude: true,
            bookings: true,
            createdAt: true,
            longitude: true,
            offers: true,
            photos: true,
            postalCode: true,
            radius: true,
            status: true,
            urgency: true,
            preferredTime: true,
            updatedAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true,
                },
            },
        },
    });
    const total = await prisma.job.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};
const getJobById = async (id) => {
    const result = await prisma.job.findUniqueOrThrow({ where: { id } });
    return result;
};
const getOffersByJobId = async (jobId) => {
    const result = await prisma.jobOffer.findMany({ where: { jobId } });
    return result;
};
const updateJobById = async (id, payload) => {
    const result = await prisma.job.update({ where: { id }, data: payload });
    return result;
};
const deleteJob = async (id) => {
    const result = await prisma.job.delete({ where: { id } });
    return result;
};
export const JobService = {
    createJob,
    getAllJobs,
    getJobById,
    getOffersByJobId,
    updateJobById,
    deleteJob,
};
