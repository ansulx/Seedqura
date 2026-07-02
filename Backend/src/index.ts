import "dotenv/config";
import express from "express";
import cors from "cors";
import { contactRouter } from "./routes/contact.js";
import { applyRouter } from "./routes/apply.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/contact", contactRouter);
app.use("/api/apply", applyRouter);

app.listen(PORT, () => {
  console.log(`Resync API running on http://localhost:${PORT}`);
});
