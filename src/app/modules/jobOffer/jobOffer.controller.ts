import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { JobOfferServices } from "./jobOffer.services.js";
import sendResponse from "src/app/shared/sendResponse.js";

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

  const result = await JobOfferServices.updateOfferById(id, {
    status: "ACCEPTED",
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
    message: "Job offer updated successfully",
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
  getOfferById,
  updateOfferById,
  deleteOfferById,
};
