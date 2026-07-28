export type Stats = {
  applications: number;
  paid: number;
  students: number;
  activeEnrollments: number;
};

export type CourseRef = { id?: string; name?: string; price_display?: string };

export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution?: string;
  year?: string;
  interest?: string;
  statement?: string;
  portfolio?: string | null;
  status: string;
  course_id: string;
  created_at: string;
  admin_notes?: string | null;
  courses: CourseRef | CourseRef[];
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    razorpay_payment_id?: string | null;
  }>;
};

export type Enrollment = {
  id: string;
  course_id: string;
  status: string;
  enrolled_at?: string;
  courses: CourseRef | CourseRef[];
};

export type Student = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  institution?: string;
  year?: string;
  interest?: string;
  created_at: string;
  enrollments: Enrollment[];
  applications: Application[];
};

export type CourseOption = {
  id: string;
  name: string;
  price_display?: string | null;
  priceDisplay?: string | null;
  price_inr?: number | null;
  price?: number | null;
  status?: string;
};

export function courseLabel(c: CourseRef | CourseRef[] | null | undefined) {
  if (!c) return "—";
  if (Array.isArray(c)) return c[0]?.name || "—";
  return c.name || "—";
}

function csvEscape(value: unknown) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][]
) {
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function adminFetch(path: string, init?: RequestInit) {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const res = await fetch(`/api/admin/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return res.json();
}
