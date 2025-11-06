import { redirect } from "next/navigation";
import { getWeekId } from "@/lib/calendar/date-utils";
import { requireSession } from "@/lib/auth/guards";

export default async function AppIndexRedirect(): Promise<never> {
  await requireSession();
  const weekId = getWeekId(new Date());
  redirect(`/app/week/${weekId}`);
}