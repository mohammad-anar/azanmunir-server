import { Request, Response } from "express";
import catchAsync from "src/app/shared/catchAsync.js";
import sendResponse from "src/app/shared/sendResponse.js";
import httpStatus from "http-status";
import { ContactService } from "./contact.service.js";

const sendContactEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.sendContactEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Contact message sent successfully",
    data: result,
  });
});

const sendWorkshopContactEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.sendWorkshopContactEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Workshop contact message sent successfully",
    data: result,
  });
});

export const ContactController = {
  sendContactEmail,
  sendWorkshopContactEmail,
};
