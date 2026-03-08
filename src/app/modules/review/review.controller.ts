import { Request, Response } from "express";
import { ReviewService } from "./review.services.js";

const createReview = async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.body);

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: result,
  });
};

const getAllReviews = async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();

  res.status(200).json({
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
};

const getReviewById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReviewService.getReviewById(id);

  res.status(200).json({
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
};

const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReviewService.updateReview(id, req.body);

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: result,
  });
};

const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ReviewService.deleteReview(id);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
};

const getReviewsByWorkshopId = async (req: Request, res: Response) => {
  const { workshopId } = req.params;

  const result = await ReviewService.getReviewsByWorkshopId(workshopId);

  res.status(200).json({
    success: true,
    message: "Workshop reviews retrieved successfully",
    data: result,
  });
};

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByWorkshopId,
};
