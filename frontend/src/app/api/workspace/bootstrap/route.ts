import { NextRequest, NextResponse } from "next/server";
import { bootstrapWorkspace } from "@/lib/server/workspace";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  const data = await bootstrapWorkspace(token);
  return NextResponse.json({ data });
}
