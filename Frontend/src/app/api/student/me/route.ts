const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const res = await fetch(`${API_URL}/api/student/me`, {
    headers: { Authorization: auth },
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
