import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: "PASSENGER" | "DRIVER" | "ADMIN";
}

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashedPassword,
      phone: data.phone,
      role: data.role ?? "PASSENGER",
    },
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}


export async function loginUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword = await comparePassword(
    password,
    user.passwordHash  
  );

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
}
