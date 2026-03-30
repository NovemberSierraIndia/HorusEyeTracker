import { WeeklyView } from "@/components/calendar/weekly-view";
import { InboxList } from "@/components/inbox/inbox-list";

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">
        Calendar & Inbox
      </h1>
      <div className="space-y-6">
        <WeeklyView />
        <InboxList />
      </div>
    </div>
  );
}
