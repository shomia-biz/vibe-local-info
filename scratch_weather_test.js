async function test() {
  const lat = "37.5665,37.2636,37.4563";
  const lon = "126.9780,127.0286,126.7052";
  
  const urls = [
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Seoul`,
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul,Asia%2FSeoul,Asia%2FSeoul`
  ];
  
  for (let url of urls) {
    try {
      console.log("Testing:", url);
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        console.log("SUCCESS: Returned array of length", data.length);
      } else {
        console.log("FAILED: Returned object", data.reason || "No reason");
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}
test();
