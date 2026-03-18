import express from "express";
import { InvoiceController } from "./invoice.controller.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { InvoiceValidation } from "./invoice.validation.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(InvoiceValidation.createInvoiceZodSchema),
  InvoiceController.createInvoice
);
router.get("/", auth(Role.ADMIN),InvoiceController.getAllInvoices);
router.get("/:id", auth(Role.ADMIN, Role.WORKSHOP), InvoiceController.getInvoiceById);
router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(InvoiceValidation.updateInvoiceZodSchema),
  InvoiceController.updateInvoice
);
router.delete("/:id", auth(Role.ADMIN), InvoiceController.deleteInvoice);
router.post("/generate-monthly", auth(Role.ADMIN), InvoiceController.generateMonthlyInvoices);
router.patch("/:id/mark-paid", auth(Role.ADMIN, Role.WORKSHOP), InvoiceController.markInvoiceAsPaid);

router.get("/workshop/:workshopId", auth(Role.ADMIN, Role.WORKSHOP), InvoiceController.getInvoicesByWorkshopId);

export const InvoiceRouter = router;
