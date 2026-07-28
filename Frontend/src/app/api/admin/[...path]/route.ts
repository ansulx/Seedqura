const API_URL = process.env.API_URL || "http://localhost:3001";

async function proxy(request: Request, path: string, init?: RequestInit) {
  const auth = request.headers.get("authorization") || "";
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const search = new URL(request.url).search;
  return proxy(request, `/api/admin/${path.join("/")}${search}`);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const body = await request.text();
  return proxy(request, `/api/admin/${path.join("/")}`, {
    method: "POST",
    body,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const body = await request.text();
  return proxy(request, `/api/admin/${path.join("/")}`, {
    method: "PATCH",
    body,
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxy(request, `/api/admin/${path.join("/")}`, {
    method: "DELETE",
  });
}
