import { prisma } from "../lib/prisma";

interface CreateRideInput {
  driverId: number;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  description?: string;
}

export async function createRide(data: CreateRideInput) {
  return prisma.ride.create({
    data: {
      driverId: data.driverId,
      origin: data.origin,
      destination: data.destination,
      departureTime: new Date(data.departureTime),
      availableSeats: data.availableSeats,
      price: data.price,
      description: data.description,
    },
  });
}

export async function getRides() {
  return prisma.ride.findMany({
    where: {
      status: "ACTIVE",
      departureTime: {
        gte: new Date(),
      },
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      departureTime: "asc",
    },
  });
}

export async function getRideById(id: number) {
  return prisma.ride.findUnique({
    where: {
      id,
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
        },
      },
      rideRequests: true,
    },
  });
}