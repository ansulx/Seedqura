import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runSql() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!password || !url) {
    throw new Error("Need SUPABASE_DB_PASSWORD and NEXT_PUBLIC_SUPABASE_URL");
  }

  const ref = new URL(url).hostname.split(".")[0];
  // Prefer direct DB host; fall back to pooler-style if needed.
  const connectionString =
    process.env.DATABASE_URL ||
    `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  const sqlPath = join(__dirname, "../supabase/schema.sql");
  const sql = readFileSync(sqlPath, "utf8");

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("[db:migrate] schema applied successfully");
  } finally {
    await client.end();
  }
}

async function ensureAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL || "admin@seedqura.com";
  const password = process.env.ADMIN_PASSWORD || "SeedquraAdmin@123";

  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Seedqura Admin", role: "admin" },
    });
    if (error) throw error;
    userId = data.user?.id;
    console.log(`[db:migrate] created admin user ${email}`);
  } else {
    console.log(`[db:migrate] admin user already exists ${email}`);
  }

  if (userId) {
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: "Seedqura Admin",
      role: "admin",
    });
    if (error) throw error;
    console.log("[db:migrate] admin profile ensured");
  }
}

async function main() {
  await runSql();
  await ensureAdmin();
}

main().catch((err) => {
  console.error("[db:migrate] failed:", err);
  process.exit(1);
});
