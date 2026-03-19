import { prisma } from "../../../helpers.ts/prisma.js";

const getActivityFeed = async (date?: string) => {
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(startOfDay.getDate() + 1);

  // 1. Fetch data from different models
  const [
    registeredWorkshops,
    approvedWorkshops,
    postedJobs,
    createdBookings,
    completedBookings,
    platformSettings,
  ] = await Promise.all([
    // Workshop Registered
    prisma.workshop.findMany({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
      select: { id: true, workshopName: true, createdAt: true },
    }),
    // Workshop Approved
    prisma.workshop.findMany({
      where: {
        approvalStatus: "APPROVED",
        updatedAt: { gte: startOfDay, lt: endOfDay },
      },
      select: { id: true, workshopName: true, updatedAt: true },
    }),
    // Job Posted
    prisma.job.findMany({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
      select: { id: true, title: true, createdAt: true, bikeName: true },
    }),
    // Booking Created
    prisma.booking.findMany({
      where: { createdAt: { gte: startOfDay, lt: endOfDay } },
      select: { id: true, createdAt: true, workshop: { select: { workshopName: true } } },
    }),
    // Booking Completed (Revenue)
    prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        updatedAt: { gte: startOfDay, lt: endOfDay },
      },
      include: {
        offer: true,
        workshop: { select: { workshopName: true, platformFees: true } },
      },
    }),
    // Platform Data Updated
    prisma.platformData.findMany({
      where: { updatedAt: { gte: startOfDay, lt: endOfDay } },
    }),
  ]);

  const platformData = await prisma.platformData.findFirst();
  const globalFee = platformData?.platformFee || 0;

  // 2. Map to common Activity shape
  const activities: any[] = [];

  registeredWorkshops.forEach((w) => {
    activities.push({
      type: "WORKSHOP_REGISTERED",
      timestamp: w.createdAt,
      message: `Workshop "${w.workshopName}" has registered.`,
      details: { id: w.id, name: w.workshopName },
    });
  });

  approvedWorkshops.forEach((w) => {
    activities.push({
      type: "WORKSHOP_APPROVED",
      timestamp: w.updatedAt,
      message: `Workshop "${w.workshopName}" has been approved.`,
      details: { id: w.id, name: w.workshopName },
    });
  });

  postedJobs.forEach((j) => {
    activities.push({
      type: "JOB_POSTED",
      timestamp: j.createdAt,
      message: `New job posted: "${j.title}" for ${j.bikeName}.`,
      details: { id: j.id, title: j.title },
    });
  });

  createdBookings.forEach((b) => {
    activities.push({
      type: "BOOKING_CREATED",
      timestamp: b.createdAt,
      message: `A new booking was created with ${b.workshop.workshopName}.`,
      details: { id: b.id },
    });
  });

  completedBookings.forEach((b) => {
    const feeRate = b.workshop?.platformFees ?? globalFee;
    const feeAmount = (b.offer?.price || 0) * (feeRate / 100);
    activities.push({
      type: "BOOKING_COMPLETED",
      timestamp: b.updatedAt,
      message: `Booking completed with ${b.workshop.workshopName}. Platform fee received: $${feeAmount.toFixed(2)}.`,
      details: { id: b.id, amount: b.offer?.price, fee: feeAmount },
    });
  });

  platformSettings.forEach((ps) => {
    activities.push({
      type: "PLATFORM_SETTINGS_UPDATED",
      timestamp: ps.updatedAt,
      message: `Platform settings (fee: ${ps.platformFee}%, radius: ${ps.maximumJobRadius}km) have been updated.`,
      details: { fee: ps.platformFee, radius: ps.maximumJobRadius },
    });
  });

  // 3. Sort by timestamp descending
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return activities;
};

export const ActivityService = {
  getActivityFeed,
};
