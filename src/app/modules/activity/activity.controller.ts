import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { ActivityService } from "./activity.service.js";

const getActivityFeed = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.query as { date: string };
  const result = await ActivityService.getActivityFeed(date);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Activity feed retrieved successfully",
    data: result,
  });
});

export const ActivityController = {
  getActivityFeed,
};
