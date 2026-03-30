"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  windSpeed: number;
  icon: string;
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = () => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setWeather(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <h2 className="text-lg font-medium text-text-primary mb-4">Weather — Rome</h2>
      {loading ? (
        <div className="h-24 bg-cream rounded-lg animate-pulse" />
      ) : weather ? (
        <div className="flex items-center gap-4">
          <img
            src={weather.icon}
            alt={weather.condition}
            className="w-16 h-16"
          />
          <div>
            <p className="font-mono text-3xl font-medium text-text-primary">
              {weather.temp}°C
            </p>
            <p className="text-sm text-text-secondary capitalize">
              {weather.condition}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Wind: {weather.windSpeed} m/s
            </p>
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-sm">Weather unavailable</p>
      )}
    </div>
  );
}
