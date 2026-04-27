import { NextRequest, NextResponse } from "next/server";
import { updateWorkspaceProfile } from "@/lib/server/workspace";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  const input = await req.json();
  const data = await updateWorkspaceProfile(token, input);
  return NextResponse.json({ data });
}
