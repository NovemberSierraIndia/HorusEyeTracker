"use client";

import { useSession } from "next-auth/react";
import { TodaysEvents } from "@/components/dashboard/todays-events";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { MotivationalCard } from "@/components/dashboard/motivational-card";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-1">
        {getGreeting()}, {firstName}
      </h1>
      <p className="text-sm text-text-muted mb-6">
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <TodaysEvents />
        <WeatherCard />
        <MotivationalCard />
      </div>
    </div>
  );
}
