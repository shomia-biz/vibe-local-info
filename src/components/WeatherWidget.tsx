'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  dust: string;
  dustValue: number;
}

export default function WeatherWidget({ isDark = false }: { isDark?: boolean }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // 1. 송파구 날씨 및 기온 (Open-Meteo API - 송파구 좌표: 37.5145, 127.106)
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5145&longitude=127.106&current_weather=true');
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;

        // 날씨 코드 변환
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

  if (loading) return <div className={`animate-pulse ${isDark ? 'bg-white/10' : 'bg-orange-50'} w-24 h-8 rounded-xl`}></div>;
  if (!weather) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all h-9 min-w-max ${isDark ? '' : 'bg-white/50 backdrop-blur-sm border border-orange-100/50 shadow-sm hover:shadow-md'}`}>
      <div className="text-lg leading-none">{weather.condition}</div>
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{weather.temp}°C</span>
          <div className={`flex items-center gap-1 border-l pl-2 ${isDark ? 'border-white/20' : 'border-gray-200'}`}>
            <span className={`text-[9px] whitespace-nowrap ${isDark ? 'text-white/60' : 'text-gray-500'}`}>미세먼지</span>
            <span className={`text-[9px] font-bold whitespace-nowrap ${weather.dustValue > 75 ? 'text-red-400' : isDark ? 'text-green-400' : 'text-green-600'}`}>
              {weather.dust}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
