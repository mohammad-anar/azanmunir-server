import express from "express";
import { ReviewController } from "./review.controller.js";

const router = express.Router();

router.post("/", ReviewController.createReview);
router.get("/", ReviewController.getAllReviews);
router.get("/:id", ReviewController.getReviewById);
router.patch("/:id", ReviewController.updateReview);
router.delete("/:id", ReviewController.deleteReview);

router.get("/workshop/:workshopId", ReviewController.getReviewsByWorkshopId);

export const ReviewRouter = router;
