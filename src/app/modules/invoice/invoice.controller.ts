import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { InvoiceService } from "./invoice.service.js";
import pick from "../../../helpers/pick.js";

// POST /invoices/generate-monthly
// Body: { month?: "YYYY-MM" }
const generateMonthlyInvoices = catchAsync(
  async (req: Request, res: Response) => {
    const { month } = req.body;
    const result = await InvoiceService.generateMonthlyInvoices(month as string);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: result.message,
      data: result,
    });
  },
);

const getMonthlyInvoices = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "status", "startDate", "endDate", "month"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await InvoiceService.getAllInvoices(
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoices retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// GET /invoices/monthly/download?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
const downloadMonthlyInvoicesPDF = catchAsync(
  async (req: Request, res: Response) => {
    const { startDate, endDate, month } = req.query;
    const buffer = await InvoiceService.downloadMonthlyInvoicesPDF(
      startDate as string,
      endDate as string,
      month as string,
    );

    const filename = `invoices-${startDate || "all"}-to-${endDate || "all"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.status(200).send(buffer);
  },
);

// PATCH /invoices/:id/status
const updateInvoiceStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InvoiceService.updateInvoiceStatus(id, "PAID");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invoice status updated successfully",
    data: result,
  });
});

// GET /invoices/:id/download
const downloadInvoicePDFById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const buffer = await InvoiceService.getInvoicePDFById(id);

  const filename = `invoice-${id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.status(200).send(buffer);
});

// GET /invoices/workshop/:workshopId/download?month=YYYY-MM
const downloadWorkshopInvoicePDF = catchAsync(async (req: Request, res: Response) => {
  const { workshopId } = req.params;
  const { month } = req.query;
  const buffer = await InvoiceService.getWorkshopInvoicePDF(workshopId, month as string);

  const filename = `invoice-${workshopId}-${month}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.status(200).send(buffer);
});

export const InvoiceController = {
  generateMonthlyInvoices,
  getMonthlyInvoices,
  downloadMonthlyInvoicesPDF,
  updateInvoiceStatus,
  downloadInvoicePDFById,
  downloadWorkshopInvoicePDF,
};
