import { Router } from "express";
import { sendContactNotification } from "../lib/mail.js";

export const contactRouter = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validSubjects = [
  "General Inquiry",
  "Partnership",
  "Academy",
  "Research Collaboration",
];

contactRouter.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};
  const fields: string[] = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    fields.push("name");
  }
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    fields.push("email");
  }
  if (!subject || !validSubjects.includes(subject)) {
    fields.push("subject");
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    fields.push("message");
  }

  if (fields.length > 0) {
    return res.status(400).json({
      ok: false,
      error: "Validation failed",
      fields,
    });
  }

  console.log("[contact]", { name, email, subject, message });

  try {
    await sendContactNotification({
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
    });
  } catch (err) {
    console.error("[contact] mail failed:", err);
  }

  return res.status(200).json({ ok: true, message: "Message received" });
});