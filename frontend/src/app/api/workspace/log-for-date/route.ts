import { NextRequest, NextResponse } from "next/server";
import { fetchDailyLogForDate } from "@/lib/server/workspace";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  const { date } = (await req.json()) as { date: string };
  const data = await fetchDailyLogForDate(token, date);
  return NextResponse.json({ data });
}
