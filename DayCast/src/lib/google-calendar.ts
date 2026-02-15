// src/lib/google-calendar.ts
import { prisma } from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/google-token";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
};

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[];
  error?: { message: string };
};

export async function syncGoogleCalendarEvents(userId: string): Promise<number> {
  try {
    const accessToken = await getValidAccessToken(userId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const calendarUrl = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    );
    calendarUrl.searchParams.set("timeMin", todayStart.toISOString());
    calendarUrl.searchParams.set("timeMax", todayEnd.toISOString());
    calendarUrl.searchParams.set("singleEvents", "true");
    calendarUrl.searchParams.set("orderBy", "startTime");

    const response = await fetch(calendarUrl.toString(), {
      headers: { Authorization: "Bearer " + accessToken },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Calendar API Error:", errorData);
      throw new Error(errorData.error?.message || "Google Calendarの取得に失敗しました");
    }

    const data: GoogleCalendarResponse = await response.json();
    const events = data.items || [];

    let syncedCount = 0;
    for (const event of events) {
      const startTime = event.start.dateTime
        ? new Date(event.start.dateTime)
        : event.start.date
        ? new Date(event.start.date)
        : new Date();

      const endTime = event.end.dateTime
        ? new Date(event.end.dateTime)
        : event.end.date
        ? new Date(event.end.date)
        : new Date();

      const existingEvent = await prisma.calendarEvent.findFirst({
        where: { userId, googleEventId: event.id },
      });

      if (existingEvent) {
        await prisma.calendarEvent.update({
          where: { id: existingEvent.id },
          data: {
            title: event.summary || "(タイトルなし)",
            description: event.description || null,
            location: event.location || null,
            startTime,
            endTime,
          },
        });
      } else {
        await prisma.calendarEvent.create({
          data: {
            userId,
            googleEventId: event.id,
            title: event.summary || "(タイトルなし)",
            description: event.description || null,
            location: event.location || null,
            startTime,
            endTime,
          },
        });
      }
      syncedCount++;
    }

    console.log("Synced " + syncedCount + " events from Google Calendar");
    return syncedCount;
  } catch (error) {
    console.error("Google Calendar sync error:", error);
    throw error;
  }
}
