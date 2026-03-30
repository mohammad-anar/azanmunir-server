import express from "express";
import { BlogController } from "./blog.controller.js";
import { CreateBlogSchema, UpdateBlogSchema } from "./blog.validation.js";
import fileUploadHandler from "app/middlewares/fileUploadHandler.js";
import auth from "app/middlewares/auth.js";
import validateRequest from "app/middlewares/validateRequest.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", BlogController.getAllBlogs);
router.post(
  "/",
  fileUploadHandler(),
  auth(Role.ADMIN),
  validateRequest(CreateBlogSchema),
  BlogController.createBlog,
);
router.get("/:slug/slug", BlogController.getBlogBySlug);
router.get("/:id", BlogController.getBlogById);
router.patch(
  "/:id",
  fileUploadHandler(),
  auth(Role.ADMIN),
  validateRequest(UpdateBlogSchema),
  BlogController.updateBlog,
);
router.delete("/:id", auth(Role.ADMIN), BlogController.deleteBlog);

export const BlogRouter = router;
