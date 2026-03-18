import express from "express";
import { BlogController } from "./blog.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import fileUploadHandler from "src/app/middlewares/fileUploadHandler.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { CreateBlogSchema, UpdateBlogSchema } from "./blog.validation.js";

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
