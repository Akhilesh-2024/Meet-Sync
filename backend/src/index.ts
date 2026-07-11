import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { logger } from "./utils/logger";

async function bootstrap() {
  await connectDB();

  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok", env: env.nodeEnv }));
  app.use("/api/v1", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(env.port, () => {
    logger.info(`MeetSync backend listening on port ${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  logger.fatal("Failed to start server", err);
  process.exit(1);
});
