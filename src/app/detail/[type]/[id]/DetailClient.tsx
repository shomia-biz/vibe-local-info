"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BackButton from "../../../components/BackButton";
import CoupangBanner from "@/components/CoupangBanner";

interface ItemData {
  id: number | string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  link: string;
  target?: string;
  blogContent?: string;
  fee?: string;
  transport?: string;
  region?: string;
  imageUrl?: string;
}

// 행사 이름/장소에 따라 지역을 판별하는 함수
const getRegion = (item: ItemData) => {
  const text = (item.name + item.location + (item.summary || '')).toLowerCase();
  if (text.includes('서울') || text.includes('송파') || text.includes('잠실') || text.includes('강북') || text.includes('관악') || text.includes('한성')) return '서울';
  if (text.includes('경기') || text.includes('군포') || text.includes('양평') || text.includes('고양') || text.includes('이천') || text.includes('화순') || text.includes('태안')) return '경기';
  if (text.includes('인천') || text.includes('송도') || text.includes('부평')) return '인천';
  return '서울';
};

// 날짜 문자열을 (월, 화...) 요일이 포함된 형식으로 변환하는 함수
const formatDateWithDay = (dateStr: string) => {
  if (!dateStr || dateStr === '상시') return dateStr;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${dateStr} (${days[date.getDay()]})`;
};

// 행사 이름에 따라 가장 어울리는 이미지를 찾아주는 함수
const getEventImage = (name: string) => {
  if (name.includes('어린이')) return 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=800&q=80';
  if (name.includes('장미') || name.includes('꽃') || name.includes('철쭉') || name.includes('튤립')) return 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80';
  if (name.includes('교향악단') || name.includes('음악회') || name.includes('콘서트')) return 'https://images.unsplash.com/photo-1465847733345-2feba59b6467?auto=format&fit=crop&w=800&q=80';
  if (name.includes('책') || name.includes('도서관')) return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80';
  if (name.includes('박물관') || name.includes('백제') || name.includes('고인돌') || name.includes('궁중') || name.includes('한옥')) return 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80';
  if (name.includes('한강') || name.includes('잠수교') || name.includes('호수')) return 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80';
  if (name.includes('나비')) return 'https://images.unsplash.com/photo-1555037015-1498966cbd7a?auto=format&fit=crop&w=800&q=80';
  if (name.includes('도자기')) return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';
  return `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80`;
};

export default function DetailClient({ itemData, type }: { itemData: ItemData, type: string }) {
  const [isDarkBg, setIsDarkBg] = useState(true);
  const isEvent = !type.toLowerCase().includes("benefit");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = itemData.imageUrl || getEventImage(itemData.name);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 40;
      canvas.height = 40;
      ctx.drawImage(img, 0, 0, 40, 40);
      const imageData = ctx.getImageData(0, 20, 40, 20).data;
      let brightness = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        brightness += (imageData[i] * 299 + imageData[i + 1] * 587 + imageData[i + 2] * 114) / 1000;
      }
      const avgBrightness = brightness / (imageData.length / 4);
      setIsDarkBg(avgBrightness < 160);
    };
  }, [itemData]);

  return (
    <main className="min-h-screen bg-[#FFFBF7] font-sans pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />
        <article className="bg-white rounded-[32px] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="relative h-64 sm:h-96 w-full overflow-hidden">
            <img 
              src={itemData.imageUrl || getEventImage(itemData.name)} 
              alt={itemData.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkBg ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' : 'bg-white/10'}`}></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider shadow-lg ${
                  type.toLowerCase().includes('seoul') ? 'bg-blue-600 text-white' : 
                  type.toLowerCase().includes('kyeonggi') ? 'bg-emerald-600 text-white' : 
                  type.toLowerCase().includes('incheon') ? 'bg-amber-600 text-white' : 
                  type.toLowerCase().includes('national') ? 'bg-rose-600 text-white' : 
                  isEvent ? 'bg-indigo-600 text-white' : 'bg-[#d97706] text-white'
                }`}>
                  {getRegion(itemData)} {itemData.category}
                </span>
              </div>
              <h1 className={`text-3xl sm:text-4xl font-black leading-tight transition-colors duration-500 break-keep ${isDarkBg ? 'text-white drop-shadow-lg' : 'text-slate-900 drop-shadow-sm'}`}>
                {itemData.name}
              </h1>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="border-l-4 border-indigo-500 bg-indigo-50/30 p-6 rounded-r-2xl mb-12">
              <p className="text-indigo-900 text-lg sm:text-xl font-bold leading-relaxed break-keep">
                "{itemData.summary}"
              </p>
            </div>

            <div className="mb-16">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">📍</span>
                기본 정보 안내
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-100">
                  <tbody>
                    <tr className="bg-slate-50/50">
                      <th className="py-2.5 px-4 w-24 sm:w-32 text-left text-slate-500 font-bold text-sm sm:text-base align-middle border border-slate-100">📅 일시</th>
                      <td className="py-2.5 px-4 text-slate-900 font-extrabold text-base sm:text-lg break-keep border border-slate-100">
                        {itemData.startDate === '상시' 
                          ? '상시 진행' 
                          : itemData.startDate === itemData.endDate 
                            ? formatDateWithDay(itemData.startDate)
                            : `${formatDateWithDay(itemData.startDate)} ~ ${formatDateWithDay(itemData.endDate)}`}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <th className="py-2.5 px-4 w-24 sm:w-32 text-left text-slate-500 font-bold text-sm sm:text-base align-middle border border-slate-100">🏛️ 장소</th>
                      <td className="py-2.5 px-4 text-slate-900 font-extrabold text-base sm:text-lg break-keep border border-slate-100">{itemData.location}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <th className="py-2.5 px-4 w-24 sm:w-32 text-left text-slate-500 font-bold text-sm sm:text-base align-middle border border-slate-100">👤 대상</th>
                      <td className="py-2.5 px-4 text-slate-900 font-extrabold text-base sm:text-lg break-keep border border-slate-100">{itemData.target || '누구나 참여 가능'}</td>
                    </tr>
                    {isEvent && (
                      <>
                        <tr className="bg-white">
                          <th className="py-2.5 px-4 w-24 sm:w-32 text-left text-slate-500 font-bold text-sm sm:text-base align-middle border border-slate-100">💳 입장료</th>
                          <td className="py-2.5 px-4 text-slate-900 font-extrabold text-base sm:text-lg break-keep border border-slate-100">{itemData.fee || '정보 확인 필요'}</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <th className="py-2.5 px-4 w-24 sm:w-32 text-left text-slate-500 font-bold text-sm sm:text-base align-middle border border-slate-100">🚗 교통편</th>
                          <td className="py-2.5 px-4 text-slate-900 font-extrabold text-base sm:text-lg break-keep border border-slate-100">{itemData.transport || '공식 홈페이지 참고'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">💡</span>
                알리미의 한줄 팁
              </h2>
              <div className="bg-slate-50 rounded-[24px] pt-6 pb-8 px-8 sm:pt-8 sm:pb-10 sm:px-10 border border-slate-100 relative">
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-2xl border border-slate-50">
                  🤖
                </div>
                <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-line break-keep font-medium">
                  {itemData.blogContent || '상세 정보는 아래 버튼을 눌러 공식 홈페이지에서 확인해 주세요!'}
                </div>
              </div>
            </div>

            <a 
              href={itemData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-full bg-slate-900 text-white font-black text-lg py-6 rounded-[20px] hover:bg-indigo-600 transition-all duration-300 shadow-xl hover:shadow-indigo-200 active:scale-[0.98] gap-3 mb-8"
            >
              <span>공식 홈페이지에서 자세히 보기</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>

            <CoupangBanner />
          </div>
        </article>
      </div>
    </main>
  );
}
