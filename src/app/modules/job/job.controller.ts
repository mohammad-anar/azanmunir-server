import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { JobService } from "./job.services.js";
import { getMultipleFilesPath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";
import ApiError from "src/errors/ApiError.js";
import pick from "src/helpers.ts/pick.js";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const payload = req.body;

  if (!id) {
    throw new ApiError(401, "User not found");
  }
  payload.userId = id;

  const image = getMultipleFilesPath(req.files, "image") as string[];
  console.log(image);
  if (!image || (image && image?.length < 0)) {
    throw new ApiError(404, "Photos not uploaded.");
  }
  if (image?.length > 0) {
    const photos = image?.map((img) =>
      `http://${config.ip_address}:${config.port}`.concat(img),
    );

    if (photos.length > 0) {
      payload.photos = photos;
    }
  }

  // console.log(payload);
  const result = await JobService.createJob(id, payload);

  sendResponse(res, {
    success: true,
    message: "Job created successfully",
    statusCode: 201,
    data: result,
  });
});
const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "status", "urgency"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await JobService.getAllJobs(filters, options);

  sendResponse(res, {
    success: true,
    message: "All jobs retrieved successfully",
    statusCode: 200,
    data: result,
  });
});
const getJobById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobService.getJobById(id);

  sendResponse(res, {
    success: true,
    message: "Job retrieved by id successfully",
    statusCode: 200,
    data: result,
  });
});
const getOffersByJobId = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const result = await JobService.getOffersByJobId(jobId);

  sendResponse(res, {
    success: true,
    message: "Job Offers retrieved by job id successfully",
    statusCode: 200,
    data: result,
  });
});
const updateJobById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await JobService.updateJobById(id, payload);

  sendResponse(res, {
    success: true,
    message: "Job updated by id successfully",
    statusCode: 200,
    data: result,
  });
});
const deleteJobById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await JobService.deleteJob(id);

  sendResponse(res, {
    success: true,
    message: "Job deleted by id successfully",
    statusCode: 200,
    data: result,
  });
});

export const JobController = {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
  getOffersByJobId,
};
