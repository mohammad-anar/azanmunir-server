import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { PlatformDataService } from "./platformData.services.js";

const createPlatformData = catchAsync(async (req: Request, res: Response) => {
  const result = await PlatformDataService.createPlatformData(req.body);

  sendResponse(res, {
    success: true,
    message: "Platform data created successfully",
    statusCode: 200,
    data: result,
  });
});

const getPlatformData = catchAsync(async (req: Request, res: Response) => {
  const result = await PlatformDataService.getPlatformData();

  sendResponse(res, {
    success: true,
    message: "Platform data retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

const updatePlatformData = catchAsync(async (req: Request, res: Response) => {
  const result = await PlatformDataService.updatePlatformData(req.body);

  sendResponse(res, {
    success: true,
    message: "Platform data updated successfully",
    statusCode: 200,
    data: result,
  });
});

export const PlatformDataController = {
  createPlatformData,
  getPlatformData,  
  updatePlatformData,
};
