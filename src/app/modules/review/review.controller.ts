import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { ReviewService } from "./review.services.js";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReviewService.getReviewById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReviewService.updateReview(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReviewService.deleteReview(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

const getReviewsByWorkshopId = catchAsync(async (req: Request, res: Response) => {
  const { workshopId } = req.params;

  const result = await ReviewService.getReviewsByWorkshopId(workshopId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workshop reviews retrieved successfully",
    data: result,
  });
});

const getReviewsByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await ReviewService.getReviewsByUserId(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByWorkshopId,
  getReviewsByUserId,
};
