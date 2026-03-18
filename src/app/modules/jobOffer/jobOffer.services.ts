import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";
import { ChatService } from "../chat/chat.service.js";
import { createAndEmitNotification } from "src/helpers.ts/socketHelper.js";
import ApiError from "src/errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createJobOffer = async (payload: Prisma.JobOfferCreateInput) => {
  const result = await prisma.jobOffer.create({ data: payload });
  return result;
};
const getOfferById = async (id: string) => {
  const result = await prisma.jobOffer.findUniqueOrThrow({ where: { id } });
  return result;
};
const updateOfferById = async (
  id: string,
  payload: Prisma.JobOfferUpdateInput,
) => {
  const result = await prisma.jobOffer.update({ where: { id }, data: payload });
  return result;
};
const deleteOffer = async (id: string) => {
  const result = await prisma.jobOffer.delete({ where: { id } });
  return result;
};

const acceptOffer = async (id: string, userId:string) => {
  // 1. Fetch offer and verify job status
  const offer = await prisma.jobOffer.findUniqueOrThrow({
    where: { id },
    include: { job: true, workshop: true }
  });

  // if have accepted offer then return 
  const acceptedOffer = await prisma.jobOffer.findFirst({
    where: { jobId: offer.jobId, status: "ACCEPTED"},
  });
  if(acceptedOffer){
    throw new ApiError(StatusCodes.BAD_REQUEST, "This job already has an accepted offer");
  }





  if(offer.job.userId !== userId){
    throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to accept this offer");
  }

  const allowedStatuses: JobStatus[] = ["PENDING", "OPEN"];
  if (!allowedStatuses.includes(offer.job.status as JobStatus)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This job already has an accepted offer or is no longer pending or open");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 2. Update Offer status
    const updatedOffer = await tx.jobOffer.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    
  // need to reject other offers
  await tx.jobOffer.updateMany({
    where: { jobId: offer.jobId, status: "PENDING"},
    data: { status: "REJECTED" },
  });

    // 3. Update Job status
    await tx.job.update({
      where: { id: offer.jobId },
      data: { status: "IN_PROGRESS" }
    });

    // 4. Create Booking
    const booking = await tx.booking.create({
      data: {
        jobId: offer.jobId,
        offerId: offer.id,
        userId: offer.job.userId,
        workshopId: offer.workshopId,
        scheduleStart: new Date(),
        scheduleEnd: offer.estimatedTime,
        status: "CONFIRMED"
      }
    });

    // 5. Create Chat Room
    const room = await ChatService.createRoom({
      bookingId: booking.id,
      userId: offer.job.userId,
      workshopId: offer.workshopId,
      name: `${offer.job.title} - Chat`
    }, tx);

    return { offer: updatedOffer, booking, room };
  });

  // 6. Send notification to workshop
  try {
    await createAndEmitNotification({
      receiverWorkshopId: offer.workshopId,
      triggeredById: offer.job.userId,
      jobId: offer.jobId,
      bookingId: result.booking.id,
      title: "Offer Accepted!",
      body: `Your offer for "${offer.job.title}" has been accepted!`,
      eventType: "OFFER_ACCEPTED"
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }

  return result;
};

export const JobOfferServices = {
  createJobOffer,
  getOfferById,
  updateOfferById,
  deleteOffer,
  acceptOffer,
};
