import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { BlogService } from "./blog.services.js";
import pick from "src/helpers.ts/pick.js";

/* ---------------- CREATE BLOG ---------------- */

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await BlogService.createBlog(payload);

  sendResponse(res, {
    success: true,
    message: "Blog created successfully",
    statusCode: 201,
    data: result,
  });
});

/* ---------------- GET ALL BLOGS ---------------- */

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await BlogService.getAllBlogs(filters, options);

  sendResponse(res, {
    success: true,
    message: "Blogs retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ---------------- GET BLOG BY ID ---------------- */

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BlogService.getBlogById(id);

  sendResponse(res, {
    success: true,
    message: "Blog retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const result = await BlogService.getBlogBySlug(slug);

  sendResponse(res, {
    success: true,
    message: "Blog retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

/* ---------------- UPDATE BLOG ---------------- */

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await BlogService.updateBlog(id, payload);

  sendResponse(res, {
    success: true,
    message: "Blog updated successfully",
    statusCode: 200,
    data: result,
  });
});

/* ---------------- DELETE BLOG ---------------- */

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BlogService.deleteBlog(id);

  sendResponse(res, {
    success: true,
    message: "Blog deleted successfully",
    statusCode: 200,
    data: result,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
