import express from "express";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { ContactController } from "./contact.controller.js";
import { ContactValidation } from "./contact.validation.js";

const router = express.Router();

router.post(
  "/",
  validateRequest(ContactValidation.createContactZodSchema),
  ContactController.sendContactEmail
);

router.post(
  "/workshop",
  validateRequest(ContactValidation.createWorkshopContactZodSchema),
  ContactController.sendWorkshopContactEmail
);

export const ContactRouter = router;
