import express from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { NewsletterController } from "./newsletter.controller.js";
import { NewsletterValidation } from "./newsletter.validation.js";

import { Role } from "@prisma/client";
import auth from "app/middlewares/auth.js";

const router = express.Router();

router.post(
  "/",
  validateRequest(NewsletterValidation.subscribe),
  NewsletterController.subscribe,
);

router.get(
  "/",
  auth(Role.ADMIN),
  NewsletterController.getAllNewsletters,
);

export const NewsletterRouter = router;
