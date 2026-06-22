import "dotenv/config";
import { createApp } from "./app.js";
import { connectMongo } from "./lib/mongoose.js";
import { logger } from "./lib/logger.js";

const app = createApp();
const PORT = process.env.PORT ?? 3001;

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      logger.info("server.started", { port: PORT });
    });
  })
  .catch((err: unknown) => {
    logger.error("server.mongo_connection_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  });
