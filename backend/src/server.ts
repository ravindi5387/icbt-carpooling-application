import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (_req, res) => {
  res.json({
    message: "ICBT Carpooling API is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Backend API is healthy",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
