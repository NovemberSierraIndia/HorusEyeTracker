import { TodaysEvents } from "@/components/dashboard/todays-events";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { MotivationalCard } from "@/components/dashboard/motivational-card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <TodaysEvents />
        <WeatherCard />
        <MotivationalCard />
      </div>
    </div>
  );
}
