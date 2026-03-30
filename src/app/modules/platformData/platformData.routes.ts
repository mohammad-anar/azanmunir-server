import express from "express";
import { Role } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest.js";
import { PlatformDataController } from "./platformData.controller.js";
import { PlatformDataValidation } from "./platformData.validation.js";
import auth from "app/middlewares/auth.js";

const router = express.Router();

// Admin-only: GET platform settings
router.get("/", auth(Role.ADMIN), PlatformDataController.getPlatformData);



// Admin-only: create platform data
router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(PlatformDataValidation.create),
  PlatformDataController.createPlatformData,
);

// Admin-only: update platform fee and maximum job radius
router.patch(
  "/",
  auth(Role.ADMIN),
  validateRequest(PlatformDataValidation.update),
  PlatformDataController.updatePlatformData,
);

export const PlatformDataRouter = router;
