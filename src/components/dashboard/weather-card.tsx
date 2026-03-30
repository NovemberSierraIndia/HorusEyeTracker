"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sunrise, Sunset, Droplets, Sun } from "lucide-react";

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  icon: string;
  sunrise: number;
  sunset: number;
  uvi: number | null;
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

  const formatUnixTime = (unix: number) => {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const getUVLabel = (uvi: number) => {
    if (uvi <= 2) return "Low";
    if (uvi <= 5) return "Moderate";
    if (uvi <= 7) return "High";
    if (uvi <= 10) return "Very High";
    return "Extreme";
  };

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <h2 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-4">
        Weather — Rome
      </h2>
      {loading ? (
        <div className="h-28 bg-cream rounded-lg animate-pulse" />
      ) : weather ? (
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Main temperature - big */}
          <div className="flex items-center gap-4">
            <Image
              src={weather.icon}
              alt={weather.condition}
              width={80}
              height={80}
              unoptimized
            />
            <div>
              <p className="font-mono text-5xl font-medium text-text-primary leading-none">
                {weather.temp}°C
              </p>
              <p className="text-sm text-text-secondary capitalize mt-1">
                {weather.condition}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Feels like {weather.feelsLike}°C
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-20 bg-border" />

          {/* Detail stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 flex-1">
            {/* Sunrise */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cream rounded-lg">
                <Sunrise size={18} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted uppercase">Sunrise</p>
                <p className="font-mono text-sm font-medium text-text-primary">
                  {formatUnixTime(weather.sunrise)}
                </p>
              </div>
            </div>

            {/* Sunset */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cream rounded-lg">
                <Sunset size={18} className="text-[#E07B39]" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted uppercase">Sunset</p>
                <p className="font-mono text-sm font-medium text-text-primary">
                  {formatUnixTime(weather.sunset)}
                </p>
              </div>
            </div>

            {/* UV Index */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cream rounded-lg">
                <Sun size={18} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted uppercase">UV Index</p>
                <p className="font-mono text-sm font-medium text-text-primary">
                  {weather.uvi !== null ? (
                    <>
                      {weather.uvi}{" "}
                      <span className="text-xs font-sans text-text-muted">
                        {getUVLabel(weather.uvi)}
                      </span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cream rounded-lg">
                <Droplets size={18} className="text-[#4A90D9]" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted uppercase">Humidity</p>
                <p className="font-mono text-sm font-medium text-text-primary">
                  {weather.humidity}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-sm">Weather unavailable</p>
      )}
    </div>
  );
}
