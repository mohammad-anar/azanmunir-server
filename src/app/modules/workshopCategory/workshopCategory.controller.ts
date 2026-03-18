import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { WorkshopCategoryService } from "./workshopCategory.services.js";
import pick from "src/helpers.ts/pick.js";
import { IPaginationOptions } from "src/types/pagination.js";

const createWorkshopCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkshopCategoryService.createWorkshopCategory(req.body);

  sendResponse(res, {
    success: true,
    message: "Workshop category created successfully",
    statusCode: 201,
    data: result,
  });
});

const getAllWorkshopCategories = catchAsync(async (req: Request, res: Response) => {
  const {id: workshopId} = req.user;
  const result = await WorkshopCategoryService.getAllWorkshopCategories(workshopId);

  sendResponse(res, {
    success: true,
    message: "Workshop categories retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

const getWorkshopCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WorkshopCategoryService.getWorkshopCategoryById(id);

  sendResponse(res, {
    success: true,
    message: "Workshop category retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

const updateWorkshopCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WorkshopCategoryService.updateWorkshopCategory(id, req.body);

  sendResponse(res, {
    success: true,
    message: "Workshop category updated successfully",
    statusCode: 200,
    data: result,
  });
});

const deleteWorkshopCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WorkshopCategoryService.deleteWorkshopCategory(id);

  sendResponse(res, {
    success: true,
    message: "Workshop category deleted successfully",
    statusCode: 200,
    data: result,
  });
});

export const WorkshopCategoryController = {
  createWorkshopCategory,
  getAllWorkshopCategories,
  getWorkshopCategoryById,
  updateWorkshopCategory,
  deleteWorkshopCategory,
};
