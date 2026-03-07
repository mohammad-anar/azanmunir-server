import { Prisma } from "@prisma/client";
import ApiError from "src/errors/ApiError.js";
import { prisma } from "src/helpers.ts/prisma.js";

const createBike = async (payload: Prisma.BikeCreateInput) => {
  const result = await prisma.bike.create({ data: payload });
  return result;
};

// const getAllBikes = async () => {};

const getBikeById = async (id: string) => {
  const result = await prisma.bike.findUnique({ where: { id } });
  if (!result) {
    throw new ApiError(404, "Bike not found!");
  }
  return result;
};

const updateBike = async (id: string, payload: Prisma.BikeUpdateInput) => {
  const result = await prisma.bike.update({ where: { id }, data: payload });
  return result;
};

const deleteBike = async (id: string) => {
  const result = await prisma.bike.delete({ where: { id } });
  return result;
};

export const BikeService = { createBike, getBikeById, updateBike, deleteBike };
