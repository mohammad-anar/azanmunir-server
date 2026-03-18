import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { InvoiceService } from "./invoice.service.js";
import pick from "../../../helpers.ts/pick.js";

const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.createInvoice(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Invoice created successfully",
    data: result,
  });
});

const getAllInvoices = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await InvoiceService.getAllInvoices(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoices retrieved successfully",
    data: result,
  });
});

const getInvoiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await InvoiceService.getInvoiceById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoice retrieved successfully",
    data: result,
  });
});

const updateInvoice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await InvoiceService.updateInvoice(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoice updated successfully",
    data: result,
  });
});

const deleteInvoice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await InvoiceService.deleteInvoice(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoice deleted successfully",
    data: result,
  });
});

const getInvoicesByWorkshopId = catchAsync(
  async (req: Request, res: Response) => {
    const { workshopId } = req.params;

    const result = await InvoiceService.getInvoicesByWorkshopId(workshopId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Workshop invoices retrieved successfully",
      data: result,
    });
  },
);

const generateMonthlyInvoices = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InvoiceService.generateMonthlyInvoices();

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Monthly invoices generated successfully",
      data: result,
    });
  },
);

const markInvoiceAsPaid = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await InvoiceService.markInvoiceAsPaid(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoice marked as paid successfully",
    data: result,
  });
});

export const InvoiceController = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesByWorkshopId,
  generateMonthlyInvoices,
  markInvoiceAsPaid,
};
