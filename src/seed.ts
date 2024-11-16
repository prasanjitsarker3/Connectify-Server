import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "./App/Common/Prisma";
import config from "./App/config";

export const seedSuperAdmin = async () => {
  try {
    if (!config.superAdmin || !config.superAdminPassword) {
      throw new Error(
        "Super Admin email or password is not defined in the environment variables."
      );
    }
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: config.superAdmin,
      },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists!");
    } else {
      const hashedPassword = await bcrypt.hash(config.superAdminPassword, 12);

      const newSuperAdmin = await prisma.user.create({
        data: {
          email: "admin123@gmail.com",
          password: hashedPassword,
          name: "ADMIN",
          profile:
            "https://img.freepik.com/premium-vector/office-worker-wearing-glasses_277909-81.jpg?ga=GA1.1.406508785.1728154460&semt=ais_hybrid",
          role: UserRole.admin,
          needPasswordChange: false,
          status: "ACTIVE",
        },
      });

      console.log("Super Admin created successfully!", newSuperAdmin);
    }
  } catch (err) {
    console.error("Error creating Super Admin:", err);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
