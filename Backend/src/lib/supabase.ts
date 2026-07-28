import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export type ApplicationStatus =
  | "payment_pending"
  | "paid"
  | "active"
  | "rejected"
  | "refunded";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export type EnrollmentStatus = "active" | "revoked" | "completed";

export type UserRole = "student" | "admin";
