import { NextRequest, NextResponse } from "next/server";
import { fetchCalendarMonthStatus } from "@/lib/server/workspace";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("leanlife_token")?.value;
  if (!token) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(req.nextUrl.searchParams.get("month") ?? new Date().getMonth() + 1);
  const data = await fetchCalendarMonthStatus(token, year, month);
  return NextResponse.json({ data });
}
