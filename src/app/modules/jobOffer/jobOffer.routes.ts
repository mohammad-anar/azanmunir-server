import express from "express";
import { JobOfferController } from "./jobOffer.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middlewares/validateRequest.js";
import {
  CreateJobOfferSchema,
  UpdateJobOfferSchema,
} from "./jobOffer.validation.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.WORKSHOP),
  validateRequest(CreateJobOfferSchema),
  JobOfferController.createJobOffer,
);
router.post("/:id/accept", auth(Role.USER), JobOfferController.acceptJobOffer);
router.get(
  "/:id",
  auth(Role.WORKSHOP, Role.USER, Role.ADMIN),
  JobOfferController.getOfferById,
);
router.patch(
  "/:id",
  auth(Role.WORKSHOP),
  validateRequest(UpdateJobOfferSchema),
  JobOfferController.updateOfferById,
);
router.delete(
  "/:id",
  auth(Role.WORKSHOP, Role.ADMIN),
  JobOfferController.deleteOfferById,
);

export const JobOfferRouter = router;
