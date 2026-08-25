// Temporary in-memory database for testing
const users: any[] = [];
const rides: any[] = [];

export const prisma = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: number } }) => {
      if (where.email) {
        return users.find(u => u.email === where.email) || null;
      }
      if (where.id) {
        return users.find(u => u.id === where.id) || null;
      }
      return null;
    },
    create: async ({ data }: { data: any }) => {
      const newUser = { id: users.length + 1, ...data };
      users.push(newUser);
      console.log("User created:", newUser);
      return newUser;
    },
    findMany: async () => users,
    update: async ({ where, data }: { where: { id: number }, data: any }) => {
      const index = users.findIndex(u => u.id === where.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...data };
        return users[index];
      }
      return null;
    },
    delete: async ({ where }: { where: { id: number } }) => {
      const index = users.findIndex(u => u.id === where.id);
      if (index !== -1) {
        const deleted = users[index];
        users.splice(index, 1);
        return deleted;
      }
      return null;
    },
  },
  ride: {
    create: async ({ data }: { data: any }) => {
      const newRide = { id: rides.length + 1, ...data };
      rides.push(newRide);
      return newRide;
    },
    findMany: async () => rides,
    findUnique: async ({ where }: { where: { id: number } }) => {
      return rides.find(r => r.id === where.id) || null;
    },
    update: async ({ where, data }: { where: { id: number }, data: any }) => {
      const index = rides.findIndex(r => r.id === where.id);
      if (index !== -1) {
        rides[index] = { ...rides[index], ...data };
        return rides[index];
      }
      return null;
    },
    delete: async ({ where }: { where: { id: number } }) => {
      const index = rides.findIndex(r => r.id === where.id);
      if (index !== -1) {
        const deleted = rides[index];
        rides.splice(index, 1);
        return deleted;
      }
      return null;
    },
  },
  booking: {
    create: async ({ data }: { data: any }) => ({ id: 1, ...data }),
    findMany: async () => [],
    findUnique: async () => null,
  },
  review: {
    create: async ({ data }: { data: any }) => ({ id: 1, ...data }),
    findMany: async () => [],
  },
  notification: {
    create: async ({ data }: { data: any }) => ({ id: 1, ...data }),
    findMany: async () => [],
  },
  vehicle: {
    create: async ({ data }: { data: any }) => ({ id: 1, ...data }),
    findMany: async () => [],
    findUnique: async () => null,
  },
  $connect: async () => {},
  $disconnect: async () => {},
} as any;