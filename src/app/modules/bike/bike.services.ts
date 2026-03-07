import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createBike = async (payload: Prisma.BikeCreateInput) => {
  const result = await prisma.bike.create({ data: payload });
  return result;
};
