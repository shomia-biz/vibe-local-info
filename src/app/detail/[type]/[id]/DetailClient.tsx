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

// 핵심 키워드(해시태그) 추출 함수
const generateHashtags = (item: any) => {
  const text = (item.summary || '') + (item.target || '') + (item.name || '');
  const keywords = [
    '무료', '예약', '선착순', '주차', '가족', '아이', '어린이', '청년', '어르신', '할인', '축제', '온라인', '체험', '공연', '전시', '소상공인', '지원금',
    '데이트', '나들이', '주말', '야경', '실내', '야외', '문화', '예술', '음악', '콘서트', '뮤지컬', '연극', '영화', '페스티벌',
    '전통', '역사', '자연', '캠핑', '피크닉', '드라이브', '산책', '힐링', '클래식', '미술', '박물관', '도서관', '교육', '강연',
    '창업', '취업', '복지', '건강', '주거', '금융', '출산', '육아', '1인가구', '대학생', '직장인'
  ];
  
  let found = keywords.filter(k => text.includes(k));
  
  // 카테고리 추가
  if (item.category) {
    found.unshift(item.category.replace(/[^\w\s가-힣]/g, '').trim());
  }

  // 제목에서 그럴싸한 단어(2~5글자) 추출해서 추가
  const titleWords = (item.name || '').split(/[\s,\[\]\(\)\-\_]+/)
    .filter((w: string) => w.length >= 2 && w.length <= 5 && !found.includes(w))
    .slice(0, 2);
    
  found = [...found, ...titleWords];

  // 중복 제거 및 최대 8개로 제한
  found = Array.from(new Set(found)).filter(Boolean).slice(0, 8);

  if (found.length === 0) return ['#추천정보', '#모아팁스꿀팁'];
  return found.map(k => `#${k}`);
};

export default function DetailClient({ itemData, type }: { itemData: ItemData, type: string }) {
  const [isDarkBg, setIsDarkBg] = useState(true);
  const isEvent = !type.toLowerCase().includes("benefit");

  const shareToKakao = () => {
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const Kakao = (window as any).Kakao;
      if (!Kakao.isInitialized()) {
        const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
        if (!appKey || appKey === '나중에_입력') {
          // 환경변수 없으면 링크 복사 폴백
          navigator.clipboard.writeText(window.location.href);
          alert('링크가 복사되었습니다! 공유해보세요.');
          return;
        }
        Kakao.init(appKey);
      }

      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: itemData.name,
          description: itemData.summary,
          imageUrl: getEventImage(itemData.name),
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '자세히 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다! 친구나 가족에게 카카오톡으로 공유해보세요.');
    }
  };

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

            <div className="mb-12">
              {/* 2번: 핵심 해시태그 요약 */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                {generateHashtags(itemData).map((tag, idx) => (
                  <span key={idx} className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full text-[15px] font-black border border-cyan-100 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 1번: 스마트 길찾기 (행사/축제이면서 장소 정보가 있을 때만 노출) */}
              {isEvent && itemData.location && (
                <div className="mb-6">
                  <a 
                    href={`https://map.kakao.com/?q=${encodeURIComponent(itemData.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#FEE500] text-[#000000] font-black text-lg py-5 rounded-2xl hover:bg-[#F4DC00] transition-colors shadow-sm"
                  >
                    <span className="text-2xl">📍</span> 카카오맵으로 행사장 길찾기
                  </a>
                </div>
              )}

              {/* 3번: 카카오톡 공유하기 */}
              <div className="mb-8">
                <button 
                  onClick={shareToKakao}
                  className="flex items-center justify-center gap-2 w-full bg-[#FEE500] text-[#000000] font-black text-lg py-5 rounded-2xl hover:bg-[#F4DC00] transition-colors shadow-sm"
                >
                  <span className="text-2xl">💬</span> 카카오톡으로 공유하기
                </button>
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
