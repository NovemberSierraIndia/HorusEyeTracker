import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Fetch current weather + UV via One Call or separate calls
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=41.9028&lon=12.4964&units=metric&appid=${apiKey.trim()}`,
      { next: { revalidate: 1800 } }
    );
    const data = await weatherRes.json();

    // UV index from separate endpoint
    let uvi = null;
    try {
      const uvRes = await fetch(
        `https://api.openweathermap.org/data/2.5/uvi?lat=41.9028&lon=12.4964&appid=${apiKey.trim()}`,
        { next: { revalidate: 1800 } }
      );
      const uvData = await uvRes.json();
      uvi = uvData.value ?? null;
    } catch {
      // UV not critical, continue without it
    }

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      uvi,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
