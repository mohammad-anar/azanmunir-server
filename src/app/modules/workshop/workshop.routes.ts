import express from "express";
import fileUploadHandler from "src/app/middlewares/fileUploadHandler.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { WorkshopController } from "./workshop.controller.js";
import { createWorkshopSchema } from "./workshop.validation.js";

const router = express.Router();

router.get("/", WorkshopController.getAllWorkshops);

router.post(
  "/register",
  fileUploadHandler(),
  validateRequest(createWorkshopSchema),
  WorkshopController.createWorkshop,
);

export const WorkshopRouter = router;
