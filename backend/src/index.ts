import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { connectMongo } from "./lib/mongoose.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", router);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

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
