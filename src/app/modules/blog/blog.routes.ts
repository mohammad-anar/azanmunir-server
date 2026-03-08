import express from "express";
import { BlogController } from "./blog.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", BlogController.getAllBlogs);
router.post("/", auth(Role.ADMIN), BlogController.createBlog);
router.get("/:id", BlogController.getBlogById);
router.patch("/:id", auth(Role.ADMIN), BlogController.updateBlog);
router.delete("/:id", auth(Role.ADMIN), BlogController.deleteBlog);

export const BlogRouter = router;
