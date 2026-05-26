async function test() {
  try {
    const loc = { lat: 37.5665, lon: 126.9780 };
    console.log("Fetching weather...");
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`);
    console.log("Weather status:", weatherRes.status);
    const weatherJson = await weatherRes.json();
    console.log("Weather JSON ok?", !!weatherJson.current);

    console.log("Fetching air...");
    const airRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lon}&current=pm10,pm2_5&timezone=Asia%2FSeoul`);
    console.log("Air status:", airRes.status);
    const airJson = await airRes.json();
    console.log("Air JSON ok?", !!airJson.current);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
