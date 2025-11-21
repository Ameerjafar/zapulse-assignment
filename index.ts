import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes/routes";
import { connectPrisma, disconnectPrisma } from "./lib/prisma";
import { env } from "./config/config";

dotenv.config();

const PORT = Number(env.BACKEND_PORT || 5000);
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", router);

async function start() {
  await connectPrisma();
  const server = app.listen(PORT, () => {
    console.log(`backend is running on this port ${PORT}`);
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
