import { Prisma } from "@prisma/client";
import { prisma } from "../../../helpers.ts/prisma.js";
import { IPaginationOptions } from "../../../types/pagination.js";
import { paginationHelper } from "../../../helpers.ts/paginationHelper.js";

const createInvoice = async (
  payload: Prisma.InvoiceCreateInput & { month?: string },
) => {
  const payloadData = payload as any;
  const workshopId = payloadData.workshopId;
  const month = payloadData.month;

  if (month) {
    // Expected format: "YYYY-MM"
    const [yearPart, monthPart] = month.split("-").map(Number);
    if (!yearPart || !monthPart || monthPart < 1 || monthPart > 12) {
      throw new Error("Invalid month format. Please use YYYY-MM.");
    }
    const startOfMonth = new Date(yearPart, monthPart - 1, 1);
    const endOfMonth = new Date(yearPart, monthPart, 0, 23, 59, 59, 999);

    // Fetch platform data for default platform fee
    const platformData = await prisma.platformData.findFirst();
    if (!platformData) {
      throw new Error(
        "Platform data not found. Please set platform fee first.",
      );
    }

    // Fetch all completed bookings for this workshop in the specified month
    const completedBookings = await prisma.booking.findMany({
      where: {
        workshopId,
        status: "COMPLETED",
        paymentStatus: "PAID",
        scheduleEnd: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        offer: true,
        workshop: {
          select: {
            platformFees: true,
          },
        },
      },
    });

    let totalAmount = 0;
    completedBookings.forEach((booking) => {
      const price = booking.offer.price || 0;
      const effectiveFee =
        booking.workshop.platformFees ?? platformData.platformFee;
      totalAmount += price * (effectiveFee / 100);
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const billingMonthName = monthNames[startOfMonth.getMonth()];
    const title = `Invoice for ${billingMonthName} ${yearPart}`;
    const dueDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      15,
    );

    // Clean up payload to avoid Prisma validation errors if 'month' is not in schema
    const { month: _, ...prismaPayload } = payloadData;

    // Use upsert to avoid duplicate invoices for the same workshop and month
    const result = await prisma.invoice.upsert({
      where: {
        workshopId_billingMonth: {
          workshopId,
          billingMonth: startOfMonth,
        },
      },
      update: {
        ...prismaPayload,
        title,
        totalAmount,
        totalJobs: completedBookings.length,
        dueDate: prismaPayload.dueDate || dueDate,
      },
      create: {
        ...prismaPayload,
        title,
        workshopId,
        totalAmount,
        billingMonth: startOfMonth,
        totalJobs: completedBookings.length,
        dueDate: prismaPayload.dueDate || dueDate,
        status: "SENT",
      },
    });
    return result;
  }

  // Fallback to manual creation if no month is provided
  // Fetch platform data for default platform fee
  const platformData = await prisma.platformData.findFirst();
  if (!platformData) {
    throw new Error("Platform data not found. Please set platform fee first.");
  }

  const inputAmount = payloadData.totalAmount || 0;

  // Fetch workshop to get custom platform fees if exists
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: { platformFees: true },
  });

  if (!workshop) {
    throw new Error("Workshop not found");
  }

  // Determine platform fee: workshop specific or default from platformData
  const effectiveFee = workshop.platformFees ?? platformData.platformFee;

  // Calculate total amount as the fee based on the provided totalAmount (assuming input is gross amount)
  const calculatedAmount = inputAmount * (effectiveFee / 100);

  const result = await prisma.invoice.create({
    data: {
      ...payload,
      totalAmount: calculatedAmount,
    },
  });

  return result;
};

const getAllInvoices = async (
  filter: { searchTerm?: string; month?: string; status?: string },
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.InvoiceWhereInput[] = [];

  if (filter.searchTerm) {
    andConditions.push({
      OR: [
        {
          workshop: {
            workshopName: {
              contains: filter.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          workshop: {
            email: {
              contains: filter.searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (filter.month) {
    // Expected format: "YYYY-MM"
    const [year, month] = filter.month.split("-").map(Number);
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      andConditions.push({
        billingMonth: {
          gte: startDate,
          lte: endDate,
        },
      });
    }
  }

  if (filter.status) {
    andConditions.push({
      status: filter.status as any,
    });
  }

  const whereConditions: Prisma.InvoiceWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.invoice.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      workshop: {
        select: {
          id: true,
          workshopName: true,
          ownerName: true,
          email: true,
          address: true,
          approvalStatus: true,
          avatar: true,
          avgRating: true,
          platformFees: true,
        },
      },
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.invoice.count({
    where: whereConditions,
  });

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: result,
  };
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

const updateInvoice = async (
  id: string,
  payload: Prisma.InvoiceUpdateInput,
) => {
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
      workshop: {
        select: {
          ownerName: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const generateMonthlyInvoices = async (month?: string) => {
  const now = new Date();
  let startOfMonth: Date;
  let endOfMonth: Date;

  if (month) {
    // Expected format: "YYYY-MM"
    const [yearPart, monthPart] = month.split("-").map(Number);
    if (!yearPart || !monthPart || monthPart < 1 || monthPart > 12) {
      throw new Error("Invalid month format. Please use YYYY-MM.");
    }
    // Month in JS is 0-indexed
    startOfMonth = new Date(yearPart, monthPart - 1, 1);
    endOfMonth = new Date(yearPart, monthPart, 0, 23, 59, 59, 999);
  } else {
    // Default to the previous month
    let previousMonth = now.getMonth() - 1;
    let year = now.getFullYear();

    if (previousMonth < 0) {
      previousMonth = 11;
      year -= 1;
    }

    startOfMonth = new Date(year, previousMonth, 1);
    endOfMonth = new Date(year, previousMonth + 1, 0, 23, 59, 59, 999);
  }

  // Fetch platform data for default platform fee
  const platformData = await prisma.platformData.findFirst();
  if (!platformData) {
    throw new Error("Platform data not found. Please set platform fee first.");
  }

  // Fetch all completed bookings in the previous month
  const completedBookings = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      paymentStatus: "PAID",
      scheduleEnd: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      offer: true,
      workshop: {
        select: {
          platformFees: true,
        },
      },
    },
  });

  // Group by workshop
  const workshopInvoiceData: Record<
    string,
    { totalJobs: number; totalAmount: number }
  > = {};

  completedBookings.forEach((booking) => {
    const workshopId = booking.workshopId;
    const price = booking.offer.price || 0;

    // Determine platform fee: workshop specific or default from platformData
    const effectiveFee =
      booking.workshop.platformFees ?? platformData.platformFee;
    const amount = price * (effectiveFee / 100);

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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const billingMonthName = monthNames[startOfMonth.getMonth()];
  const billingYear = startOfMonth.getFullYear();
  const title = `Invoice for ${billingMonthName} ${billingYear}`;

  for (const workshopId in workshopInvoiceData) {
    const data = workshopInvoiceData[workshopId];

    // We can use upsert to avoid creating duplicates if run multiple times
    const result = await prisma.invoice.upsert({
      where: {
        workshopId_billingMonth: {
          workshopId: workshopId,
          billingMonth: startOfMonth,
        },
      },
      update: {
        totalJobs: data.totalJobs,
        totalAmount: data.totalAmount,
        dueDate: dueDate,
      },
      create: {
        title,
        workshopId,
        billingMonth: startOfMonth,
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
