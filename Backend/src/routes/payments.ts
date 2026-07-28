import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { provisionStudentFromApplication } from "../lib/provision.js";

export const paymentsRouter = Router();

function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured");
  }
  return new Razorpay({ key_id, key_secret });
}

function publicKey() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}

paymentsRouter.post("/order", async (req, res) => {
  const { applicationId } = req.body ?? {};
  if (!applicationId || typeof applicationId !== "string") {
    return res.status(400).json({ ok: false, error: "applicationId is required" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: application, error } = await supabase
      .from("applications")
      .select("id, name, email, phone, status, course_id, courses(id, name, price_inr, currency)")
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      return res.status(404).json({ ok: false, error: "Application not found" });
    }
    if (!["payment_pending", "paid"].includes(application.status)) {
      return res.status(400).json({
        ok: false,
        error: `Cannot pay for application in status ${application.status}`,
      });
    }

    const course = Array.isArray(application.courses)
      ? application.courses[0]
      : application.courses;
    if (!course?.price_inr) {
      return res.status(400).json({ ok: false, error: "Course is not payable" });
    }

    // Reuse an existing unpaid order if present
    const { data: existing } = await supabase
      .from("payments")
      .select("id, razorpay_order_id, amount, currency, status")
      .eq("application_id", applicationId)
      .eq("status", "created")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.razorpay_order_id) {
      return res.json({
        ok: true,
        orderId: existing.razorpay_order_id,
        amount: existing.amount,
        currency: existing.currency,
        key: publicKey(),
        applicationId,
        prefill: {
          name: application.name,
          email: application.email,
          contact: application.phone,
        },
        courseName: course.name,
      });
    }

    const razorpay = getRazorpay();
    const amountPaise = course.price_inr * 100;
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: course.currency || "INR",
      receipt: `app_${applicationId.replace(/-/g, "").slice(0, 32)}`,
      notes: {
        application_id: applicationId,
        course_id: course.id,
      },
    });

    const { error: payError } = await supabase.from("payments").insert({
      application_id: applicationId,
      razorpay_order_id: order.id,
      amount: course.price_inr,
      currency: course.currency || "INR",
      status: "created",
    });
    if (payError) throw payError;

    return res.json({
      ok: true,
      orderId: order.id,
      amount: course.price_inr,
      currency: course.currency || "INR",
      key: publicKey(),
      applicationId,
      prefill: {
        name: application.name,
        email: application.email,
        contact: application.phone,
      },
      courseName: course.name,
    });
  } catch (err) {
    console.error("[payments/order]", err);
    const rzpDesc =
      err &&
      typeof err === "object" &&
      "error" in err &&
      err.error &&
      typeof err.error === "object" &&
      "description" in err.error
        ? String((err.error as { description?: string }).description || "")
        : "";
    const message =
      err instanceof Error && err.message.includes("Razorpay")
        ? "Payment gateway is not configured yet"
        : rzpDesc.toLowerCase().includes("authentication")
          ? "Razorpay authentication failed — check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
          : "Unable to create payment order";
    return res.status(500).json({ ok: false, error: message });
  }
});

/** Client-side verification fallback when webhooks are delayed (still requires signature). */
paymentsRouter.post("/verify", async (req, res) => {
  const { applicationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body ?? {};

  if (
    !applicationId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({ ok: false, error: "Missing payment fields" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ ok: false, error: "Payment gateway not configured" });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Invalid payment signature" });
  }

  try {
    const result = await finalizePaidOrder({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      applicationId,
    });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[payments/verify]", err);
    return res.status(500).json({ ok: false, error: "Unable to verify payment" });
  }
});

export async function razorpayWebhookHandler(req: Request, res: Response) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ ok: false, error: "Webhook secret missing" });
  }

  const signature = req.headers["x-razorpay-signature"];
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody || typeof signature !== "string") {
    return res.status(400).json({ ok: false, error: "Invalid webhook request" });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return res.status(400).json({ ok: false, error: "Invalid webhook signature" });
  }

  try {
    const event = JSON.parse(rawBody.toString("utf8")) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            status?: string;
          };
        };
      };
    };

    if (event.event === "payment.captured" || event.event === "payment.authorized") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id && payment?.id) {
        await finalizePaidOrder({
          orderId: payment.order_id,
          paymentId: payment.id,
          webhook: event,
        });
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[payments/webhook]", err);
    return res.status(500).json({ ok: false, error: "Webhook processing failed" });
  }
}

async function finalizePaidOrder(input: {
  orderId: string;
  paymentId: string;
  signature?: string;
  applicationId?: string;
  webhook?: unknown;
}) {
  const supabase = getSupabaseAdmin();

  const { data: payment, error } = await supabase
    .from("payments")
    .select("id, application_id, status, razorpay_payment_id")
    .eq("razorpay_order_id", input.orderId)
    .maybeSingle();

  if (error) throw error;
  if (!payment) throw new Error(`Payment row not found for order ${input.orderId}`);

  if (
    input.applicationId &&
    payment.application_id !== input.applicationId
  ) {
    throw new Error("Application mismatch for payment");
  }

  // Idempotent: already provisioned
  if (payment.status === "paid" && payment.razorpay_payment_id) {
    const { data: app } = await supabase
      .from("applications")
      .select("id, status, user_id")
      .eq("id", payment.application_id)
      .single();
    if (app?.status === "active" && app.user_id) {
      return { alreadyProcessed: true, applicationId: app.id, userId: app.user_id };
    }
  }

  const { error: payUpdateError } = await supabase
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: input.paymentId,
      razorpay_signature: input.signature || null,
      raw_webhook: input.webhook || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);
  if (payUpdateError) throw payUpdateError;

  const { error: appUpdateError } = await supabase
    .from("applications")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.application_id)
    .in("status", ["payment_pending", "paid"]);
  if (appUpdateError) throw appUpdateError;

  const provisioned = await provisionStudentFromApplication(payment.application_id);
  return {
    alreadyProcessed: false,
    applicationId: payment.application_id,
    userId: provisioned.userId,
  };
}
