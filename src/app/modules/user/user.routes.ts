import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "src/app/middlewares/validateRequest";

const router = express.Router();

router.post("/", validateRequest(), UserController.createUser);

export const UserRouter = router;
