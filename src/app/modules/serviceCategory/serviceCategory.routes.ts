import express from "express";
import { ServiceCategoryController } from "./serviceCategory.controller.js";

import { Role } from "@prisma/client";
import auth from "app/middlewares/auth.js";

const router = express.Router();

router.get("/", ServiceCategoryController.getAllCategories);

router.post("/", auth(Role.ADMIN), ServiceCategoryController.createCategory);

router.get("/:id", ServiceCategoryController.getCategoryById);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  ServiceCategoryController.updateCategory,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  ServiceCategoryController.deleteCategory,
);

export const ServiceCategoryRouter = router;
