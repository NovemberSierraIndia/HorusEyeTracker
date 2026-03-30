"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  windSpeed: number;
  humidity: number;
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
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={weather.icon}
              alt={weather.condition}
              width={64}
              height={64}
              unoptimized
            />
            <div>
              <p className="font-mono text-3xl font-medium text-text-primary">
                {weather.temp}°C
              </p>
              <p className="text-sm text-text-secondary capitalize">
                {weather.condition}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-text-muted">Feels like</p>
              <p className="font-mono text-sm text-text-primary">{weather.feelsLike}°C</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Wind</p>
              <p className="font-mono text-sm text-text-primary">{weather.windSpeed} m/s</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Humidity</p>
              <p className="font-mono text-sm text-text-primary">{weather.humidity}%</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-sm">Weather unavailable</p>
      )}
    </div>
  );
}
