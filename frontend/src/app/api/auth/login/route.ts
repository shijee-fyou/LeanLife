import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEANLIFE_BACKEND_URL ?? "http://127.0.0.1:4010";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(`${BACKEND_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await upstream.json()) as { data?: { accessToken?: string }; error?: { message: string } };

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const token = data.data?.accessToken;
  if (!token) {
    return NextResponse.json({ error: { message: "No token in response." } }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("leanlife_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 86_400,
    path: "/",
  });
  return res;
}
