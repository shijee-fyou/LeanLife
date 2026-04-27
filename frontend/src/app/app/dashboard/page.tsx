import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { bootstrapWorkspace } from "@/lib/server/workspace";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const token = (await cookies()).get("leanlife_token")?.value;
  if (!token) redirect("/login");

  const initialData = await bootstrapWorkspace(token);
  return <DashboardWorkspace initialData={initialData} />;
}
