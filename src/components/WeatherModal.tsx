"use client";

import { useEffect, useState } from "react";

export interface DailyForecast {
  dateStr: string; // 예: "5/25"
  dayOfWeek: string; // 예: "(월)"
  icon: string; // 예: "☁️"
  maxTemp: number; // 최고기온
  minTemp: number; // 최저기온
}

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  forecasts: DailyForecast[];
}

export default function WeatherModal({ isOpen, onClose, cityName, forecasts }: WeatherModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 영역 */}
        <div className="px-6 pt-8 pb-4 border-b border-slate-50 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="닫기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
          
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 bg-cyan-50 text-cyan-500 text-[11px] font-black rounded-full">
            7일 일기예보
          </div>
          <h2 className="text-[22px] font-black text-slate-900 tracking-tight">
            {cityName} 주간 날씨 예보
          </h2>
        </div>

        {/* 리스트 영역 */}
        <div className="px-4 py-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {forecasts.map((day, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between px-5 py-4 rounded-2xl ${
                  idx === 0 ? 'bg-slate-50 border border-slate-100' : 'hover:bg-slate-50 transition-colors'
                }`}
              >
                <div className="flex items-center gap-1 w-[80px]">
                  <span className={`text-[15px] font-black ${idx === 0 ? 'text-slate-800' : 'text-slate-600'}`}>
                    {idx === 0 ? '오늘' : day.dateStr}
                  </span>
                  {idx !== 0 && (
                    <span className="text-[13px] font-bold text-slate-400">{day.dayOfWeek}</span>
                  )}
                </div>
                
                <div className="text-[26px]">
                  {day.icon}
                </div>
                
                <div className="flex items-center justify-end gap-3 w-[80px]">
                  <span className="text-[15px] font-black text-rose-500">{day.maxTemp}°</span>
                  <span className="text-[12px] font-black text-slate-300">/</span>
                  <span className="text-[15px] font-black text-cyan-500">{day.minTemp}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
