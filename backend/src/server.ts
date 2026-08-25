import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();