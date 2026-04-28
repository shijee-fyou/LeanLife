import { NextRequest, NextResponse } from "next/server";
import { updateWorkspaceProfile } from "@/lib/server/workspace";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  try {
    const input = await req.json();
    const data = await updateWorkspaceProfile(token, input);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "server error";
    console.error("[profile route]", message);
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
