import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { JobService } from "./job.services.js";
import { getMultipleFilesPath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const image = getMultipleFilesPath(req.files, "image") as string[];
  const photos = image.map((img) =>
    `http://${config.ip_address}:${config.port}`.concat(img),
  );

  if (photos.length > 0) {
    payload.photos = photos;
  }

  const result = await JobService.createJob(payload);

  sendResponse(res, {
    success: true,
    message: "Job created successfully",
    statusCode: 201,
    data: result,
  });
});

export const JobController = {
  createJob,
};
