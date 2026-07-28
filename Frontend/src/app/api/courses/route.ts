const API_URL = process.env.API_URL || "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${API_URL}/api/courses`, {
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
