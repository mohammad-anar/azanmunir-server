import { Role } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth.js";
import { ActivityController } from "./activity.controller.js";

const router = express.Router();

router.get(
  "/daily-feed",
  auth(Role.ADMIN),
  ActivityController.getActivityFeed,
);

export const ActivityRouter = router;
