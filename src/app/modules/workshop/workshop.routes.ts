import express from "express";
import fileUploadHandler from "src/app/middlewares/fileUploadHandler.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { WorkshopController } from "./workshop.controller.js";
import {
  createWorkshopSchema,
  updateWorkshopSchema,
} from "./workshop.validation.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", WorkshopController.getAllWorkshops);
router.get("/me", auth(Role.WORKSHOP), WorkshopController.getMe);
router.get("/me/jobs", auth(Role.WORKSHOP), WorkshopController.getNearbyJobs);

router.post(
  "/register",
  fileUploadHandler(),
  validateRequest(createWorkshopSchema),
  WorkshopController.createWorkshop,
);

router.post("/login", WorkshopController.loginWorkshop);
router.post("/verify-workshop", WorkshopController.verifyWorkshop);
router.post("/resend-otp", WorkshopController.resendWorkshopOTP);
router.post("/forget-password", WorkshopController.forgetWorkshopPassword);
router.post(
  "/reset-password",
  auth(Role.WORKSHOP),
  WorkshopController.resetWorkshopPassword,
);
router.post(
  "/change-password",
  auth(Role.WORKSHOP),
  WorkshopController.changeWorkshopPassword,
);
router.get(
  "/:id",
  auth(Role.ADMIN, Role.WORKSHOP, Role.USER),
  WorkshopController.getWorkshopById,
);
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.WORKSHOP),
  fileUploadHandler(),
  validateRequest(updateWorkshopSchema),
  WorkshopController.updateWorkshop,
);
router.delete("/:id", WorkshopController.deleteWorkshop);

export const WorkshopRouter = router;
