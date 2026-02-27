import { Role } from "@prisma/client";
import express from "express";
import auth from "src/app/middlewares/auth.js";
import { UserController } from "./user.controller.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import fileUploadHandler from "src/app/middlewares/fileUploadHandler.js";
import { UserValidation } from "./user.validation.js";

const router = express.Router();

router.get("/users", UserController.getAllUsers);
router.post(
  "/register",
  fileUploadHandler(),
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser,
);
router.post("/login", UserController.login);
router.post("/verify-user", UserController.verifyUser);
router.post("/resend-otp", UserController.resendOTP);
router.post("/forget-password", UserController.forgetPassword);
router.post(
  "/reset-password",
  auth(Role.USER, Role.ADMIN, Role.WORKSHOP),
  UserController.resetPassword,
);
router.get("/user/:id", auth(Role.ADMIN), UserController.getUserById);
router.patch(
  "/user/:id",
  auth(Role.ADMIN, Role.USER, Role.WORKSHOP),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser,
);
router.delete("/user:id", UserController.deleteUser);

export const UserRouter = router;
