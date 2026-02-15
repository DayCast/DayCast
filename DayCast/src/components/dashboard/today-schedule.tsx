import { Card } from "@/components/ui/Card";

type EventItem = {
  id: string;
  title: string;
  location: string | null;
  startTime: Date;
  endTime: Date;
};

export function TodaySchedule({ events }: { events: EventItem[] }) {
  return (
    <Card title="今日の予定" icon="📅">
      {events.length === 0 ? (
        <p className="text-sm text-slate-400">予定はありません</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              {/* Time */}
              <div className="flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="mt-1 text-xs font-medium text-slate-500">
                  {formatTime(event.startTime)}
                </span>
              </div>
              {/* Event */}
              <div className="flex-1 rounded-lg bg-primary-light px-3 py-2">
                <p className="text-sm font-medium text-slate-800">
                  {event.title}
                </p>
                {event.location && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    @{event.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
