import { prisma } from "../lib/prisma";

interface RequestRideInput {
  passengerId: number;
  rideId: number;
  seats: number;
}

export async function requestRide(data: RequestRideInput) {
  // Check if ride exists
  const ride = await prisma.ride.findUnique({
    where: { id: data.rideId },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.availableSeats < data.seats) {
    throw new Error("Not enough seats available");
  }

  // Check if user already requested
  const existing = await prisma.booking.findUnique({
    where: {
      rideId_passengerId: {
        rideId: data.rideId,
        passengerId: data.passengerId,
      },
    },
  });

  if (existing) {
    throw new Error("You have already requested this ride");
  }

  // Create booking request
  const booking = await prisma.booking.create({
    data: {
      rideId: data.rideId,
      passengerId: data.passengerId,
      seats: data.seats,
      status: "PENDING",
    },
    include: {
      ride: {
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,   
              lastName: true,    
              email: true,
            },
          },
        },
      },
    },
  });

  return booking;
}

export async function getMyBookings(passengerId: number) {
  return prisma.booking.findMany({
    where: {
      passengerId,
    },
    include: {
      ride: {
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRideRequests(rideId: number, driverId: number) {
  // Check if ride belongs to driver
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.driverId !== driverId) {
    throw new Error("You are not the driver of this ride");
  }

  return prisma.booking.findMany({
    where: {
      rideId,
      status: "PENDING",
    },
    include: {
      passenger: {
        select: {
          id: true,
          firstName: true,  
          lastName: true,    
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function acceptRequest(bookingId: number, driverId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.ride.driverId !== driverId) {
    throw new Error("You are not the driver of this ride");
  }

  if (booking.status !== "PENDING") {
    throw new Error("This request is already processed");
  }


  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
    },
    include: {
      ride: true,
      passenger: true,
    },
  });

  
  await prisma.ride.update({
    where: { id: booking.rideId },
    data: {
      availableSeats: {
        decrement: booking.seats,
      },
    },
  });

  return updated;
}

export async function rejectRequest(bookingId: number, driverId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,  // ← Add this!
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.ride.driverId !== driverId) {
    throw new Error("You are not the driver of this ride");
  }

  if (booking.status !== "PENDING") {
    throw new Error("This request is already processed");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "REJECTED",
    },
    include: {
      ride: true,
      passenger: true,
    },
  });
}

export async function cancelBooking(bookingId: number, userId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.passengerId !== userId && booking.ride.driverId !== userId) {
    throw new Error("You are not authorized to cancel this booking");
  }

  if (booking.status === "COMPLETED") {
    throw new Error("Cannot cancel completed booking");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
    },
  });

  
  if (booking.status === "CONFIRMED") {
    await prisma.ride.update({
      where: { id: booking.rideId },
      data: {
        availableSeats: {
          increment: booking.seats,
        },
      },
    });
  }

  return updated;
}
