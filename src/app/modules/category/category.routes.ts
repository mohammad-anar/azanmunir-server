import express from "express";
import validateRequest from "../../middlewares/validateRequest.js";

import { Role } from "@prisma/client";
import { CategoryController } from "./category.controller.js";
import { CreateCategorySchema } from "./category.validation.js";
import auth from "app/middlewares/auth.js";

const router = express.Router();

router.get("/", CategoryController.getAllCategories);
router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(CreateCategorySchema),
  CategoryController.createCategory,
);

router.get("/:id", CategoryController.getCategoryById);
router.patch("/:id", auth(Role.ADMIN), CategoryController.updateCategory);
router.delete("/:id", auth(Role.ADMIN), CategoryController.deleteCategory);

export const CategoryRouter = router;
