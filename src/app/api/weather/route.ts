import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=41.9028&lon=12.4964&units=metric&appid=${apiKey.trim()}`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
