import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import { getSingleFilePath } from "src/app/shared/getFilePath.js";
import config from "src/config/index.js";
import { WorkshopService } from "./workshop.services.js";
import sendResponse from "src/app/shared/sendResponse.js";
import { Prisma } from "@prisma/client";
import pick from "src/helpers.ts/pick.js";

const createWorkshop = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const image = getSingleFilePath(req.files, "image") as string;
  const url = `http://${config.ip_address}:${config.port}`.concat(image);

  if (image) {
    payload.avatar = url;
  }

  // service will handle hashing of the plain password
  const result = await WorkshopService.createWorkshop(payload);

  sendResponse(res, {
    success: true,
    message: "Workshop created",
    statusCode: 201,
    data: result,
  });
});

const getAllWorkshops = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["role", "searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await WorkshopService.getAllWorkshops(filters, options);

  sendResponse(res, {
    success: true,
    message: "Workshops retrieve successfully",
    statusCode: 200,
    data: result,
  });
});


const getWorkshopById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WorkshopService.getWorkshopById(id);

  sendResponse(res, {
    success: true,
    message: "Workshop retrieved successfully",
    statusCode: 200,
    data: result,
  });
});

const updateWorkshop = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const image = getSingleFilePath(req.files, "image") as string;

  if (image) {
    const url = `http://${config.ip_address}:${config.port}${image}`;
    payload.avatar = url; // 👈 using avatar field
  }

  const result = await WorkshopService.updateWorkshop(id, payload);

  sendResponse(res, {
    success: true,
    message: "Workshop updated successfully",
    statusCode: 200,
    data: result,
  });
});



const deleteWorkshop = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WorkshopService.deleteWorkshop(id);

  sendResponse(res, {
    success: true,
    message: "Workshop deleted successfully",
    statusCode: 200,
    data: result,
  });
});


const loginWorkshop = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await WorkshopService.loginWorkshop(payload);

  sendResponse(res, {
    success: true,
    message: "Workshop logged in successfully",
    statusCode: 200,
    data: result,
  });
});


const verifyWorkshop = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await WorkshopService.verifyWorkshop(payload);

  sendResponse(res, {
    success: true,
    message: "Workshop verified successfully",
    statusCode: 200,
    data: result,
  });
});



const resendWorkshopOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await WorkshopService.resendWorkshopOTP(email);

  sendResponse(res, {
    success: true,
    message: "OTP resent successfully",
    statusCode: 200,
    data: result,
  });
});



const forgetWorkshopPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await WorkshopService.forgetWorkshopPassword(email);

    sendResponse(res, {
      success: true,
      message: "Password reset email sent successfully",
      statusCode: 200,
      data: result,
    });
  },
);


const resetWorkshopPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.user; // workshop JWT payload
    const { password } = req.body;

    const result = await WorkshopService.resetWorkshopPassword(email, password);

    sendResponse(res, {
      success: true,
      message: "Password reset successfully",
      statusCode: 200,
      data: result,
    });
  },
);


const changeWorkshopPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.user;
    const { oldPassword, newPassword } = req.body;

    const result = await WorkshopService.changeWorkshopPassword(
      email,
      newPassword,
      oldPassword,
    );

    sendResponse(res, {
      success: true,
      message: "Password changed successfully",
      statusCode: 200,
      data: result,
    });
  },
);





export const WorkshopController = {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
  loginWorkshop,
  verifyWorkshop,
  resendWorkshopOTP,
  forgetWorkshopPassword,
  resetWorkshopPassword,
  changeWorkshopPassword,
};
