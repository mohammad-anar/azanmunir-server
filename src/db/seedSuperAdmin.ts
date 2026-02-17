import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "src/app/shared/prisma.js";
import config from "src/config/index.js";

export const seedSuperAdmin = async () => {
  const isExist = await prisma.user.findFirst({
    where: {
      email: config.admin.email,
      role: Role.ADMIN,
    },
  });


  if (!isExist) {
    const hashedPassword = await bcrypt.hash(
      config.admin.password as string,
      10,
    );

    await prisma.user.create({
      data: {
        name: config.admin.name as string,
        email: config.admin.email as string,
        phone: config.admin.phone as string,
        password: hashedPassword,
        avatar: config.admin.avatar as string,
        role: Role.ADMIN,
        isVerified: true,
      },
    });
  }else {
    console.log("Super admin already exist.")
  }
};
