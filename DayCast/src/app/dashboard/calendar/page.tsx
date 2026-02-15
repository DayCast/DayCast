import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  // Get events for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const events = await prisma.calendarEvent.findMany({
    where: {
      userId: session.user.id,
      startTime: {
        gte: startOfMonth.toISOString(),
        lte: endOfMonth.toISOString(),
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">カレンダー</h1>
        <div className="flex gap-2">
          <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
            月
          </button>
          <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
            週
          </button>
        </div>
      </div>
      
      <CalendarView events={events} />
    </div>
  );
}
