"use client";

import { useState } from "react";
import localData from "../../public/data/local-info.json";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

interface BaseInfo {
  id: number | string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  summary: string;
  link: string;
  updatedAt?: string;
}

interface EventItem extends BaseInfo {
  target?: string;
}

interface BenefitItem extends BaseInfo {
  target?: string;
}

interface LocalData {
  events: EventItem[];
  benefits: BenefitItem[];
  seoulEvents?: EventItem[];
  nationalEvents?: EventItem[];
}

const data = localData as unknown as LocalData;

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState('서울');
  const [timeTab, setTimeTab] = useState('thisWeek'); // 'thisWeek', 'past', 'upcoming'

  // 오전 1시 기준 오늘 날짜 계산
  const getMoatipsToday = () => {
    const now = new Date();
    if (now.getHours() < 1) {
      now.setDate(now.getDate() - 1);
    }
    return now;
  };

  const today = getMoatipsToday();
  const currentDateStr = today.toISOString().split('T')[0];

  // 이번 주 일요일 계산
  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() + (0 - today.getDay() + 7) % 7);
  const thisSundayStr = thisSunday.toISOString().split('T')[0];

  // 다음 주 월요일 계산
  const nextMonday = new Date(thisSunday);
  nextMonday.setDate(thisSunday.getDate() + 1);
  const nextMondayStr = nextMonday.toISOString().split('T')[0];

  const currentDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 행사 이름/장소에 따라 지역을 판별하는 함수
  const getRegion = (event: EventItem) => {
    const text = (event.name + event.location + (event.summary || '')).toLowerCase();
    if (text.includes('서울') || text.includes('송파') || text.includes('잠실') || text.includes('강북') || text.includes('관악') || text.includes('한성')) return '서울';
    if (text.includes('경기') || text.includes('군포') || text.includes('양평') || text.includes('고양') || text.includes('이천') || text.includes('화순') || text.includes('태안')) return '경기';
    if (text.includes('인천') || text.includes('송도') || text.includes('부평')) return '인천';
    return '서울'; // 기본값
  };

  // 모든 행사 데이터 통합
  const allEvents = [
    ...(data.events || []),
    ...(data.seoulEvents || []),
    ...(data.nationalEvents || [])
  ].map(event => ({
    ...event,
    region: getRegion(event as EventItem)
  }));

  // 새로운 정보 개수 계산 (오늘~3일 이내 시작하는 행사)
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);
  const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];
  
  const newInfoCount = allEvents.filter(event => 
    event.startDate >= currentDateStr && event.startDate <= threeDaysLaterStr
  ).length;

  // 필터링 로직
  const filteredEvents = allEvents.filter(event => {
    const regionMatch = selectedRegion === '전체' || event.region === selectedRegion;

    if (timeTab === 'all') {
      return regionMatch;
    }
    if (timeTab === 'past') {
      return regionMatch && event.endDate < currentDateStr;
    }
    if (timeTab === 'upcoming') {
      return regionMatch && event.startDate >= nextMondayStr;
    }
    // 이번 주 행사 (오늘 ~ 이번주 일요일까지 진행 중인 것)
    const isDuringThisWeek = event.startDate <= thisSundayStr && event.endDate >= currentDateStr;
    return regionMatch && isDuringThisWeek;
  });

  // 행사 이름에 따라 가장 어울리는 이미지를 찾아주는 함수

  // 행사 이름에 따라 가장 어울리는 이미지를 찾아주는 함수
  const getEventImage = (name: string) => {
    if (name.includes('어린이')) return 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=400&q=80'; // 놀이공원/아이
    if (name.includes('장미') || name.includes('꽃') || name.includes('철쭉') || name.includes('튤립')) return 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=400&q=80'; // 꽃
    if (name.includes('교향악단') || name.includes('음악회') || name.includes('콘서트')) return 'https://images.unsplash.com/photo-1465847733345-2feba59b6467?auto=format&fit=crop&w=400&q=80'; // 오케스트라
    if (name.includes('책') || name.includes('도서관')) return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80'; // 도서관
    if (name.includes('박물관') || name.includes('백제') || name.includes('고인돌') || name.includes('궁중') || name.includes('한옥')) return 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=400&q=80'; // 한국 전통/박물관
    if (name.includes('한강') || name.includes('잠수교') || name.includes('호수')) return 'https://images.unsplash.com/photo-1538669715515-5c31d102e35a?auto=format&fit=crop&w=400&q=80'; // 한강/물가
    if (name.includes('나비')) return 'https://images.unsplash.com/photo-1555037015-1498966cbd7a?auto=format&fit=crop&w=400&q=80'; // 나비
    if (name.includes('도자기')) return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80'; // 도자기
    return `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80`; // 기본 풍경
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 구조화 데이터: Event & GovernmentService */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...data.events.map(event => ({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": event.name,
              "startDate": event.startDate,
              "endDate": event.endDate,
              "location": {
                "@type": "Place",
                "name": event.location,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Songpa-gu",
                  "addressRegion": "Seoul",
                  "addressCountry": "KR"
                }
              },
              "description": event.summary
            })),
            ...data.benefits.map(benefit => ({
              "@context": "https://schema.org",
              "@type": "GovernmentService",
              "name": benefit.name,
              "description": benefit.summary,
              "provider": {
                "@type": "GovernmentOrganization",
                "name": "송파구청"
              },
              "serviceType": "Government Benefits"
            }))
          ])
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Hero Section */}
        <section className="text-center pt-8 pb-0">
          <div className="inline-block px-4 py-1.5 mb-6 bg-cyan-50 text-cyan-600 rounded-full text-sm font-bold tracking-tight animate-flash-pulse shadow-sm border border-cyan-100">
            오늘 <span className="text-amber-600 font-black">{newInfoCount}</span>개의 새로운 정보가 도착했습니다 💌
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            수도권 나들이부터<br />
            <span className="text-cyan-500">지원금 혜택</span>까지 한눈에
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium break-keep">
            서울, 경기, 인천 지역의 놓치기 아쉬운 정보를 엄선했습니다.<br />
            모아팁스에서 생활에 힘이 되는 혜택을 지금 바로 확인해 보세요.
          </p>
        </section>

        {/* 수도권 날씨 정보 위젯 */}
        <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-100/50 rounded-[32px] p-1 shadow-sm space-y-1">
          {/* 첫 번째 줄: 오늘 날씨 */}
          <div className="bg-white/80 backdrop-blur-md rounded-t-[30px] rounded-b-[10px] px-8 py-2 flex flex-col md:grid md:grid-cols-[100px_1fr_1fr_1fr_100px] items-center gap-6 md:gap-0">
            {/* 왼쪽: 타이틀 */}
            <div className="flex flex-col items-center md:items-start md:pr-4 md:border-r border-slate-100 w-full">
              <span className="text-[14px] font-black text-cyan-600 mb-0.5 whitespace-nowrap">오늘 날씨</span>
              <span className="text-[11px] font-bold text-slate-400">수도권</span>
            </div>

            {/* 중앙: 도시별 날씨 */}
            {[
              { city: '서울', temp: '14°', desc: '구름조금', dust: '좋음', icon: '☁️' },
              { city: '경기', temp: '13°', desc: '흐림', dust: '좋음', icon: '☁️' },
              { city: '인천', temp: '13°', desc: '흐림', dust: '보통', icon: '🌥️' }
            ].map((w, idx) => (
              <div key={w.city} className={`flex items-center gap-4 w-full justify-center md:justify-start md:pl-10 ${idx !== 2 ? 'md:border-r border-slate-50' : ''}`}>
                <span className="text-[15px] font-black text-slate-700 min-w-[30px]">{w.city}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{w.icon}</span>
                  <span className="text-[18px] font-black text-slate-900">{w.temp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-500">{w.desc}</span>
                  <span className="w-px h-2 bg-slate-200"></span>
                  <span className={`text-[10px] font-black ${w.dust === '좋음' ? 'text-cyan-500' : 'text-amber-500'}`}>
                    미세: {w.dust}
                  </span>
                </div>
              </div>
            ))}

            {/* 오른쪽: 기준 시간 */}
            <div className="md:pl-4 md:border-l border-slate-100 hidden lg:flex justify-end w-full">
              <span className="text-[12px] font-bold text-slate-300 whitespace-nowrap">
                {new Date().getHours()}:{new Date().getMinutes() < 30 ? '00' : '30'} 기준
              </span>
            </div>
          </div>

          {/* 두 번째 줄: 주말 예보 */}
          <div className="bg-white/60 backdrop-blur-md rounded-b-[30px] rounded-t-[10px] px-8 py-2 flex flex-col md:grid md:grid-cols-[100px_1fr_1fr_1fr_100px] items-center gap-6 md:gap-0">
            <div className="flex flex-col items-center md:items-start md:pr-4 md:border-r border-slate-100 w-full">
              <span className="text-[14px] font-black text-rose-500 mb-0.5 whitespace-nowrap">주말 예보</span>
              <span className="text-[11px] font-bold text-slate-400">수도권</span>
            </div>

            {[
              { region: '서울', sat: '22°', sun: '20°', satIcon: '☀️', sunIcon: '⛅' },
              { region: '경기', sat: '21°', sun: '19°', satIcon: '☀️', sunIcon: '⛅' },
              { region: '인천', sat: '21°', sun: '19°', satIcon: '☀️', sunIcon: '🌥️' }
            ].map((r, idx) => (
              <div key={r.region} className={`flex items-center gap-4 w-full justify-center md:justify-start md:pl-10 ${idx !== 2 ? 'md:border-r border-slate-50' : ''}`}>
                <span className="text-[15px] font-black text-slate-700 min-w-[30px]">{r.region}</span>
                <div className="flex items-center gap-4 bg-slate-50/50 px-3 py-1 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-blue-500">토</span>
                    <span className="text-sm">{r.satIcon}</span>
                    <span className="text-[14px] font-extrabold text-slate-700">{r.sat}</span>
                  </div>
                  <div className="w-px h-2.5 bg-slate-200"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-rose-500">일</span>
                    <span className="text-sm">{r.sunIcon}</span>
                    <span className="text-[14px] font-extrabold text-slate-700">{r.sun}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="md:pl-4 md:border-l border-slate-100 hidden lg:flex justify-end w-full">
              <span className="text-[12px] font-bold text-slate-300 whitespace-nowrap italic">
                야외활동 추천 🌳
              </span>
            </div>
          </div>
        </div>

        {/* 모아팁스 행사/축제 */}
        <section id="events">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎈</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">모아팁스 행사/축제</h2>
            </div>

            {/* 필터 컨트롤 */}
            <div className="flex flex-wrap items-center gap-6">
              {/* 기간 선택 탭 */}
              <div className="flex items-center">
                <div className="bg-[#47A1B8] text-white px-4 py-2 rounded-l-lg font-bold text-sm min-w-[60px] text-center">
                  기간
                </div>
                <div className="flex bg-white border border-[#47A1B8] rounded-r-lg overflow-hidden">
                  {[
                    { id: 'all', label: '전체' },
                    { id: 'thisWeek', label: '이번 주' },
                    { id: 'upcoming', label: '진행 예정' },
                    { id: 'past', label: '지난 행사' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTimeTab(tab.id)}
                      className={`px-4 py-2 font-bold text-sm transition-all border-l first:border-l-0 border-slate-100 ${timeTab === tab.id
                          ? 'bg-black text-white'
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 지역 선택 탭 */}
              <div className="flex items-center">
                <div className="bg-[#47A1B8] text-white px-4 py-2 rounded-l-lg font-bold text-sm min-w-[60px] text-center">
                  지역
                </div>
                <div className="flex bg-white border border-[#47A1B8] rounded-r-lg overflow-hidden">
                  {['전체', '서울', '경기', '인천'].map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-5 py-2 font-bold text-sm transition-all border-l first:border-l-0 border-slate-100 ${selectedRegion === region
                          ? 'bg-black text-white'
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {filteredEvents.map((event) => (
              <Link
                key={`${event.id}-${event.name}`}
                href={`/detail/events/${event.id}`}
                className="group bg-white rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row overflow-hidden h-full"
              >
                {/* Left: Image Area */}
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 shrink-0 overflow-hidden">
                  <img
                    src={getEventImage(event.name)}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Right: Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md">
                      {(event as any).region}
                    </span>
                    {event.endDate < currentDateStr ? (
                      <span className="bg-slate-400 text-white text-[10px] font-black px-2.5 py-1 rounded-md">
                        종료
                      </span>
                    ) : event.startDate >= nextMondayStr ? (
                      <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md">
                        예정
                      </span>
                    ) : (
                      <span className="bg-cyan-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md">
                        이번주
                      </span>
                    )}
                  </div>

                  <h3 className="text-[18px] font-black text-slate-900 mb-2 leading-tight group-hover:text-cyan-500 transition-colors">
                    {event.name}
                  </h3>

                  <p className="text-[14px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {event.summary}
                  </p>

                  <div className="mt-auto space-y-1.5 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                      <span>📅</span>
                      <span className="font-medium">{event.startDate} ~ {event.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                      <span>📍</span>
                      <span className="font-medium truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 중앙 광고 영역 */}
        <AdBanner />

        {/* 지원금/혜택 정보 */}
        <section id="benefits">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🎁</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">지원금/혜택 정보</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {data.benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="group bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col"
              >
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-50 rounded-full opacity-30 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="flex flex-col gap-3 mb-6 relative z-10">
                  <span className="self-start bg-rose-50 text-rose-500 text-[13px] font-bold px-4 py-1.5 rounded-full">
                    {benefit.category}
                  </span>
                  <h3 className="font-extrabold text-2xl sm:text-3xl text-slate-900 group-hover:text-rose-500 transition-colors">{benefit.name}</h3>
                </div>

                <p className="text-slate-600 mb-8 flex-grow leading-relaxed relative z-10 text-lg font-medium">
                  {benefit.summary}
                </p>

                <div className="space-y-4 text-sm sm:text-base text-slate-600 bg-slate-50 p-6 rounded-2xl relative z-10 mb-8 border border-slate-100">
                  {benefit.target && (
                    <p className="flex items-start gap-3">
                      <span className="font-bold min-w-[45px] text-slate-400">대상</span>
                      <span className="font-semibold">{benefit.target}</span>
                    </p>
                  )}
                  <p className="flex items-start gap-3">
                    <span className="font-bold min-w-[45px] text-slate-400">기간</span>
                    <span className="font-semibold">{benefit.startDate === '상시' ? '상시 진행' : `${benefit.startDate} ~ ${benefit.endDate}`}</span>
                  </p>
                </div>

                <Link
                  href={`/detail/benefits/${benefit.id}`}
                  className="w-full text-center bg-rose-500 text-white font-black py-4 rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 relative z-10 text-lg"
                >
                  자세히 알아보기
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[40px] p-10 sm:p-16 text-center text-white overflow-hidden relative shadow-2xl shadow-cyan-100">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
              매일 새로운 혜택 소식을<br />
              가장 빠르게 받아보세요!
            </h2>
            <p className="text-white/80 text-lg mb-10 font-medium">
              모아팁스 카카오 채널을 추가하고<br className="sm:hidden" /> 스마트한 수도권 생활을 시작하세요.
            </p>
            <button className="bg-white text-cyan-600 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl">
              카카오 채널 추가하기 💬
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 border-t border-slate-200 text-center pb-10">
          <div className="flex justify-center gap-6 mb-8">
            <Link href="/" className="text-slate-400 hover:text-slate-600 font-bold">홈</Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-600 font-bold">블로그</Link>
            <Link href="/about" className="text-slate-400 hover:text-slate-600 font-bold">소개</Link>
          </div>
          <p className="text-slate-400 text-sm mb-2 font-medium">
            데이터 출처: 공공데이터포털 및 각 지자체 공식 홈페이지
          </p>
          <p className="text-slate-300 text-xs">
            © 2024 모아팁스 Moatips. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-300 mt-4">
            마지막 업데이트: {currentDate}
          </p>
        </footer>

      </div>
    </main>
  );
}
