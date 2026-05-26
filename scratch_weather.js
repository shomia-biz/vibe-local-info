async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul';
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Failed:", res.status, await res.text());
    return;
  }
  const data = await res.json();
  console.log("Success:", JSON.stringify(data.current, null, 2));
}

fetchWeather();
