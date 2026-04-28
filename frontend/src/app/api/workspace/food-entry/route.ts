import { NextRequest, NextResponse } from "next/server";
import { addWorkspaceFood, deleteWorkspaceFood } from "@/lib/server/workspace";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  try {
    const payload = (await req.json()) as { logDate: string; input: Record<string, unknown> };
    const data = await addWorkspaceFood(token, payload.logDate, payload.input);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "server error";
    console.error("[food-entry route]", message);
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  try {
    const payload = (await req.json()) as { logDate: string; entryId: string };
    const data = await deleteWorkspaceFood(token, payload.logDate, payload.entryId);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "server error";
    console.error("[food-entry delete route]", message);
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
