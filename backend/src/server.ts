import "dotenv/config";
import app from "./app";
// import { prisma } from "./lib/prisma";  // ← temporarily disabled

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // await prisma.$connect();  // ← temporarily disabled
    // console.log("Database connected successfully");  // ← temporarily disabled

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    // await prisma.$disconnect();  // ← temporarily disabled

    process.exit(1);
  }
}

startServer();