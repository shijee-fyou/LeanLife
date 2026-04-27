import { NextRequest, NextResponse } from "next/server";
import { updateWorkspaceDailyLog } from "@/lib/server/workspace";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  const payload = (await req.json()) as { logDate: string; input: Record<string, unknown> };
  const data = await updateWorkspaceDailyLog(token, payload.logDate, payload.input);
  return NextResponse.json({ data });
}
