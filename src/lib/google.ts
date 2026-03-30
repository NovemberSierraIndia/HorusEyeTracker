export const CALENDAR_IDS = [
  "primary",
  "a5878ca75ed9df85cbab83f537bbd1e430bd6d863f7f261135e37e91f0b6f2ba@group.calendar.google.com",
];

export async function googleFetch(url: string, accessToken: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google API error: ${res.status} ${res.statusText} — ${body}`);
  }
  return res.json();
}

export async function fetchEventsFromAllCalendars(
  accessToken: string,
  timeMin: string,
  timeMax: string,
  timeZone?: string
) {
  const tzParam = timeZone ? `&timeZone=${encodeURIComponent(timeZone)}` : "";

  const allEvents = await Promise.all(
    CALENDAR_IDS.map(async (calId) => {
      try {
        const data = await googleFetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=250${tzParam}`,
          accessToken
        );
        return (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.summary || "(No title)",
          start: item.start?.dateTime || item.start?.date,
          end: item.end?.dateTime || item.end?.date,
        }));
      } catch (err) {
        console.error(`[HorusEye] Failed to fetch calendar ${calId}:`, err);
        return [];
      }
    })
  );

  return allEvents.flat().sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}
