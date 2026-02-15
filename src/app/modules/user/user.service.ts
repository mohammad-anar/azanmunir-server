import { prisma } from "src/app/shared/prisma";
import config from "../../../config";
import bcrypt from "bcryptjs";

const createUser = async (payload: any) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_solt_round,
  );

  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
  });

  return result;
};

export const UserServices = {
  createUser,
};
