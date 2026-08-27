import { prisma } from "../lib/prisma";

interface CreateRideInput {
  driverId: number;
  vehicleId: number;  
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  description?: string;
}

export async function createRide(data: CreateRideInput) {
  console.log("Creating ride with data:", data);  
  
  return prisma.ride.create({
    data: {
      driverId: data.driverId,
      vehicleId: data.vehicleId,  
      startLocation: data.origin,
      destination: data.destination,
      departureTime: new Date(data.departureTime),
      availableSeats: data.availableSeats,
      pricePerSeat: data.price,
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
          firstName: true,
          lastName: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
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
          firstName: true,
          lastName: true,
        },
      },
      vehicle: true,
      bookings: true,
    },
  });
}
