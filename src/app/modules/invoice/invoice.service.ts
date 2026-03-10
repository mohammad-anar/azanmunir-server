import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createInvoice = async (payload: Prisma.InvoiceCreateInput) => {
  const result = await prisma.invoice.create({
    data: payload,
  });

  return result;
};

const getAllInvoices = async () => {
  const result = await prisma.invoice.findMany({
    include: {
      workshop: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getInvoiceById = async (id: string) => {
  const result = await prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: {
      workshop: true,
    },
  });

  return result;
};

const updateInvoice = async (id: string, payload: Prisma.InvoiceUpdateInput) => {
  const result = await prisma.invoice.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteInvoice = async (id: string) => {
  const result = await prisma.invoice.delete({
    where: { id },
  });

  return result;
};

const getInvoicesByWorkshopId = async (workshopId: string) => {
  const result = await prisma.invoice.findMany({
    where: { workshopId },
    include: {
      workshop: {select:{ownerName:true, email:true, phone:true, address:true, role:true, id:true}}
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const generateMonthlyInvoices = async () => {
  const now = new Date();
  
  // Get start and end dates of the previous month
  let previousMonth = now.getMonth() - 1;
  let year = now.getFullYear();
  
  if (previousMonth < 0) {
    previousMonth = 11;
    year -= 1;
  }
  
  const startOfPreviousMonth = new Date(year, previousMonth, 1);
  const endOfPreviousMonth = new Date(year, previousMonth + 1, 0, 23, 59, 59, 999);

  // Fetch all completed bookings in the previous month
  const completedBookings = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      scheduleEnd: {
        gte: startOfPreviousMonth,
        lte: endOfPreviousMonth,
      },
      // Ensure we only look at bookings that successfully mapped to a completed job (just to be safe)
      job: {
        status: "COMPLETED"
      }
    },
    include: {
      offer: true,
    },
  });

  // Group by workshop
  const workshopInvoiceData: Record<string, { totalJobs: number; totalAmount: number }> = {};
  
  completedBookings.forEach((booking) => {
    const workshopId = booking.workshopId;
    const amount = booking.offer.price || 0;
    
    if (!workshopInvoiceData[workshopId]) {
      workshopInvoiceData[workshopId] = { totalJobs: 0, totalAmount: 0 };
    }
    
    workshopInvoiceData[workshopId].totalJobs += 1;
    workshopInvoiceData[workshopId].totalAmount += amount;
  });

  // Generate invoices
  const invoicesCreated = [];
  
  // Set due date to x days from now? Let's say 15th of current month
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 15);

  for (const workshopId in workshopInvoiceData) {
    const data = workshopInvoiceData[workshopId];
    
    // We can use upsert to avoid creating duplicates if run multiple times
    const result = await prisma.invoice.upsert({
      where: {
        workshopId_billingMonth: {
          workshopId: workshopId,
          billingMonth: startOfPreviousMonth,
        }
      },
      update: {
        totalJobs: data.totalJobs,
        totalAmount: data.totalAmount,
        dueDate: dueDate,
      },
      create: {
        workshopId,
        billingMonth: startOfPreviousMonth,
        totalJobs: data.totalJobs,
        totalAmount: data.totalAmount,
        dueDate: dueDate,
        status: "SENT",
      },
    });
    
    invoicesCreated.push(result);
  }

  return invoicesCreated;
};

const markInvoiceAsPaid = async (id: string) => {
  const result = await prisma.invoice.update({
    where: { id },
    data: {
      status: "PAID",
    },
  });

  return result;
};

export const InvoiceService = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesByWorkshopId,
  generateMonthlyInvoices,
  markInvoiceAsPaid,
};
