import { Prisma, Role } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import {
  IPaginationOptions,
  IUserFilterRequest,
} from "src/types/pagination.js";
import { ICreateWorkshop } from "./workshop.interfaces.js";

// create workshop ================================
const createWorkshop = async (payload: ICreateWorkshop) => {
  const { workshopName, email, phone, password, address, avatar, ...rest } =
    payload;
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: workshopName,
        email,
        phone,
        address,
        avatar,
        role: Role.WORKSHOP,
        password,
      },
    });
    const workshop = await tx.workshop.create({
      data: {
        ...rest,
        workshopName,
        address,
        userId: user.id,
      },
    });

    return workshop;
  });
};

// get all workshops ===============================================
const getAllWorkshops = async (
  params: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.WorkshopWhereInput[] = [];
  if (params.searchTerm) {
    andConditions.push({
      OR: ["workshopName", "ownerName", "address", "description"].map(
        (field) => ({
          [field]: {
            contains: params.searchTerm,
            mode: "insensitive",
          },
        }),
      ),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.WorkshopWhereInput = { AND: andConditions };

  const result = await prisma.workshop.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.workshop.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const WorkshopService = { createWorkshop, getAllWorkshops };
