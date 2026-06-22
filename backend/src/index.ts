import "dotenv/config";
import { createApp } from "./app.js";
import { connectMongo } from "./lib/mongoose.js";

const app = createApp();
const PORT = process.env.PORT ?? 3001;

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
