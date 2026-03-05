import express from "express";
import validateRequest from "../../middlewares/validateRequest.js";

import { Role } from "@prisma/client";
import auth from "src/app/middlewares/auth.js";
import { JobController } from "./job.controller.js";
import { CreateJobSchema } from "./job.validation.js";
import fileUploadHandler from "src/app/middlewares/fileUploadHandler.js";

const router = express.Router();

router.get("/", auth(Role.ADMIN), JobController.createJob);
router.post(
  "/",
  fileUploadHandler(),
  auth(Role.USER),
  validateRequest(CreateJobSchema),
  JobController.createJob,
);

export const JobRouter = router;
