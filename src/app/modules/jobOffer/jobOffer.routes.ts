import express from "express";
import { JobOfferController } from "./jobOffer.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { CreateJobOfferSchema } from "./jobOffer.validation.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.WORKSHOP),
  validateRequest(CreateJobOfferSchema),
  JobOfferController.createJobOffer,
);

export const JobOfferRouter = router;
