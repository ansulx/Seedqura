const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type ApiResponse = {
  ok: boolean;
  message?: string;
  error?: string;
  fields?: string[];
};

export async function postJson<T extends Record<string, unknown>>(
  endpoint: string,
  body: T
): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}
