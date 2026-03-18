import { Request, Response } from "express";
import { JobOfferServices } from "./jobOffer.services.js";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";

const createJobOffer = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await JobOfferServices.createJobOffer(payload);

  sendResponse(res, {
    success: true,
    message: "Job offer created successfully",
    statusCode: 201,
    data: result,
  });
});
const getOfferById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobOfferServices.getOfferById(id);

  sendResponse(res, {
    success: true,
    message: "Job offer retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const updateOfferById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await JobOfferServices.updateOfferById(id, payload);

  sendResponse(res, {
    success: true,
    message: "Job offer updated successfully",
    statusCode: 200,
    data: result,
  });
});
const acceptJobOffer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobOfferServices.acceptOffer(id);

  sendResponse(res, {
    success: true,
    message: "Job offer accepted and booking created successfully",
    statusCode: 200,
    data: result,
  });
});
const declineJobOffer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobOfferServices.updateOfferById(id, {
    status: "REJECTED",
  });

  if (!result) {
    return sendResponse(res, {
      success: false,
      message: "Job offer not found",
      statusCode: 404,
      data: null,
    });
  }

  sendResponse(res, {
    success: true,
    message: "Job offer declined successfully",
    statusCode: 200,
    data: result,
  });
});
const deleteOfferById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobOfferServices.deleteOffer(id);

  sendResponse(res, {
    success: true,
    message: "Job offer deleted successfully",
    statusCode: 200,
    data: result,
  });
});

export const JobOfferController = {
  createJobOffer,
  acceptJobOffer,
  declineJobOffer,
  getOfferById,
  updateOfferById,
  deleteOfferById,
};
