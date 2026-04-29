'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  dust: string;
  dustValue: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // 1. 송파구 날씨 및 기온 (Open-Meteo API - 송파구 좌표: 37.5145, 127.106)
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5145&longitude=127.106&current_weather=true');
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        // 날씨 코드 변환 (간단히)
        const getCondition = (code: number) => {
          if (code === 0) return '맑음 ☀️';
          if (code <= 3) return '구름 ☁️';
          if (code <= 67) return '비 ☔';
          if (code <= 77) return '눈 ❄️';
          return '흐림 🌫️';
        };

        // 2. 송파구 미세먼지 (Open-Meteo Air Quality API)
        const dustRes = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.5145&longitude=127.106&current=pm10');
        const dustData = await dustRes.json();
        const pm10 = dustData.current.pm10;
        
        setWeather({
          temp: Math.round(current.temperature),
          condition: getCondition(current.weathercode),
          dustValue: Math.round(pm10),
          dust: pm10 <= 30 ? '좋음' : pm10 <= 80 ? '보통' : '나쁨'
        });
      } catch (err) {
        console.error('날씨 정보를 가져오는데 실패했습니다.', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) return <div className="animate-pulse bg-orange-50 w-32 h-10 rounded-full"></div>;
  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md">
      <div className="text-xl">{weather.condition}</div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-800">{weather.temp}°C</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500">미세먼지</span>
          <span className={`text-[10px] font-bold ${weather.dustValue > 75 ? 'text-red-500' : 'text-green-600'}`}>
            {weather.dustValue <= 30 ? '좋음' : weather.dustValue <= 80 ? '보통' : '나쁨'}
          </span>
        </div>
      </div>
    </div>
  );
}
