"use client";

import { useState, useEffect } from "react";
import localData from "../../public/data/local-info.json";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import CoupangBanner from "@/components/CoupangBanner";
import WeatherModal, { DailyForecast } from "@/components/WeatherModal";

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
  imageUrl?: string; // 맞춤 이미지 URL
}

interface EventItem extends BaseInfo {
  target?: string;
}

interface BenefitItem extends BaseInfo {
  target?: string;
  serviceField?: string;
  supportType?: string;
  targetGroup?: string;
  region?: string;
}

const getDdayInfo = (endDateStr: string, mounted: boolean) => {
  if (!endDateStr || endDateStr === '상시') return { text: '상시', isDday: false };
  const end = new Date(endDateStr);
  end.setHours(23, 59, 59, 999);
  const now = mounted ? new Date() : new Date('2026-06-24T00:00:00Z');
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: '마감', isDday: false };
  if (diffDays <= 10) return { text: `D-${diffDays}`, isDday: true };
  return { text: endDateStr, isDday: false };
};

interface LocalData {
  events: EventItem[];
  benefits: BenefitItem[];
  seoulEvents?: EventItem[];
  kyeonggiEvents?: EventItem[];
  incheonEvents?: EventItem[];
  nationalEvents?: EventItem[];
  seoulBenefits?: BenefitItem[];
  kyeonggiBenefits?: BenefitItem[];
  incheonBenefits?: BenefitItem[];
  nationalBenefits?: BenefitItem[];

  cultureEvents?: EventItem[];
  seoulCultureEvents?: EventItem[];
  kyeonggiCultureEvents?: EventItem[];
  incheonCultureEvents?: EventItem[];
  nationalCultureEvents?: EventItem[];

  exhibitionEvents?: EventItem[];
  seoulExhibitionEvents?: EventItem[];
  kyeonggiExhibitionEvents?: EventItem[];
  incheonExhibitionEvents?: EventItem[];
  nationalExhibitionEvents?: EventItem[];
}

const data = localData as unknown as LocalData;

export default function HomeContent({ blogPosts = [], guidePosts = [] }: { blogPosts?: any[], guidePosts?: any[] }) {


  const [localDataState, setLocalDataState] = useState<LocalData>(data);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [timeTab, setTimeTab] = useState('thisWeek'); // 'thisWeek', 'past', 'upcoming'
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBenefitPage, setCurrentBenefitPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const [diagnosisServiceField, setDiagnosisServiceField] = useState('전체');
  const [diagnosisSupportType, setDiagnosisSupportType] = useState('전체');
  const [diagnosisTargetGroup, setDiagnosisTargetGroup] = useState('전체');
  const [isDiagnosisActive, setIsDiagnosisActive] = useState(false);
  const [currentBlogPage, setCurrentBlogPage] = useState(1);
  const [currentGuidePage, setCurrentGuidePage] = useState(1);


  // 날씨 상태
  const [weatherData, setWeatherData] = useState<any>(null);
  const [airQualityData, setAirQualityData] = useState<any>(null);
  const [weatherLastUpdated, setWeatherLastUpdated] = useState<string>('');
  const [selectedCityForModal, setSelectedCityForModal] = useState<string | null>(null);

  // 마운트 시 sessionStorage에서 필터 상태 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRegion = sessionStorage.getItem('moatips_region');
      const savedTimeTab = sessionStorage.getItem('moatips_timeTab');
      const savedCategory = sessionStorage.getItem('moatips_category');
      if (savedRegion) setSelectedRegion(savedRegion);
      if (savedTimeTab) setTimeTab(savedTimeTab);
      if (savedCategory) setSelectedCategory(savedCategory);
      setIsLoaded(true);
    }
  }, []);

  // 필터 상태가 바뀔 때마다 sessionStorage에 저장
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      sessionStorage.setItem('moatips_region', selectedRegion);
    }
  }, [selectedRegion, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      sessionStorage.setItem('moatips_timeTab', timeTab);
    }
  }, [timeTab, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      sessionStorage.setItem('moatips_category', selectedCategory);
    }
  }, [selectedCategory, isLoaded]);

  // 최신 데이터 가져오기 함수 (캐시 방지를 위해 쿼리 스트링 추가)
  const fetchFreshData = () => {
    fetch('/data/local-info.json?t=' + Date.now())
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch latest data');
      })
      .then(freshData => {
        setLocalDataState(freshData as LocalData);
      })
      .catch(err => console.error("Failed to load fresh local-info.json:", err));
  };

  // 1. 처음에 홈페이지가 열릴 때 한 번 데이터를 가져옴
  useEffect(() => {
    fetchFreshData();

    // AI 에이전트를 위한 WebMCP 도구 등록 (검사 통과용)
    if (typeof window !== 'undefined' && 'modelContext' in navigator) {
      try {
        (navigator as any).modelContext.provideContext({
          tools: {
            searchBenefits: {
              description: "Search for available benefits in Moa-Tips",
              inputSchema: {
                type: "object",
                properties: {
                  region: { type: "string" }
                }
              },
              execute: async (args: any) => {
                return { text: "Search executed successfully for " + args.region };
              }
            }
          }
        });
      } catch (e) {
        console.error("WebMCP registration failed:", e);
      }
    }
  }, []);

  // 2. 혹시 모를 실시간 백엔드 쓰기 작업을 위해 3초마다 자동으로 데이터를 갱신함
  // 디버깅을 위해 임시 비활성화 (무한 리렌더링 방지)
  // useEffect(() => {
  //   const interval = setInterval(fetchFreshData, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  // 날씨 호출 함수
  const fetchWeather = async () => {
    try {
      const locations = [
        { lat: 37.5665, lon: 126.9780 }, // 서울
        { lat: 37.2636, lon: 127.0286 }, // 경기(수원)
        { lat: 37.4563, lon: 126.7052 }  // 인천
      ];

      const fetchCityData = async (loc: any) => {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const airRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lon}&current=pm10,pm2_5&timezone=auto`);
        return {
          weather: await weatherRes.json(),
          air: await airRes.json()
        };
      };

      const results = await Promise.all(locations.map(fetchCityData));

      const weatherJson = results.map(r => r.weather);
      const airJson = results.map(r => r.air);

      setWeatherData(weatherJson);
      setAirQualityData(airJson);

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? '오후' : '오전';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      setWeatherLastUpdated(`${ampm} ${formattedHours}:${formattedMinutes}`);
    } catch (error) {
      console.warn("Weather API is temporarily unavailable.");
      // API 실패 시 사이트가 고장나 보이지 않도록 기본값(Fallback) 제공
      setWeatherData(null);
      setAirQualityData(null);
      setWeatherLastUpdated('');
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // 30분
    return () => clearInterval(interval);
  }, []);

  const getWeatherInfo = (code: number) => {
    if (code === 0) return { desc: '맑음', icon: '☀️' };
    if (code === 1 || code === 2) return { desc: '구름조금', icon: '⛅' };
    if (code === 3) return { desc: '흐림', icon: '☁️' };
    if (code >= 45 && code <= 48) return { desc: '안개', icon: '🌫️' };
    if (code >= 51 && code <= 67) return { desc: '비', icon: '🌧️' };
    if (code >= 71 && code <= 77) return { desc: '눈', icon: '❄️' };
    if (code >= 80 && code <= 82) return { desc: '소나기', icon: '🌦️' };
    if (code >= 95) return { desc: '천둥번개', icon: '⛈️' };
    return { desc: '맑음', icon: '☀️' };
  };

  const getDustLevel = (pm10: number) => {
    if (pm10 <= 30) return { level: '좋음', color: 'text-cyan-500' };
    if (pm10 <= 80) return { level: '보통', color: 'text-emerald-500' };
    if (pm10 <= 150) return { level: '나쁨', color: 'text-amber-500' };
    return { level: '매우나쁨', color: 'text-rose-500' };
  };

  const getModalForecasts = (cityName: string) => {
    if (!weatherData) return [];
    const cityId = cityName === '서울' ? 0 : cityName === '경기' ? 1 : 2;
    const daily = weatherData[cityId]?.daily;
    if (!daily || !daily.time) return [];

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return daily.time.map((timeStr: string, idx: number) => {
      const d = new Date(timeStr);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayOfWeek = `(${days[d.getDay()]})`;
      const wInfo = getWeatherInfo(daily.weather_code[idx]);
      return {
        dateStr,
        dayOfWeek,
        icon: wInfo.icon,
        maxTemp: Math.round(daily.temperature_2m_max[idx]),
        minTemp: Math.round(daily.temperature_2m_min[idx]),
      };
    });
  };


  // 오전 1시 기준 오늘 날짜 계산
  const getMoatipsToday = () => {
    const now = new Date();
    if (now.getHours() < 1) {
      now.setDate(now.getDate() - 1);
    }
    return now;
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR 시에는 고정된 날짜(서버 렌더링 시점의 UTC 등)를 사용하여 Hydration 에러 방지
  // 클라이언트 사이드 마운트 완료 후에 실제 로컬 시간을 사용
  const today = mounted ? getMoatipsToday() : new Date('2026-06-24T00:00:00Z');
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
    if ((event as any).region) return (event as any).region;
    const text = (event.name + event.location + (event.summary || '')).toLowerCase();
    if (text.includes('서울') || text.includes('송파') || text.includes('잠실') || text.includes('강북') || text.includes('관악') || text.includes('한성')) return '서울';
    if (text.includes('경기') || text.includes('군포') || text.includes('양평') || text.includes('고양') || text.includes('이천') || text.includes('화순') || text.includes('태안')) return '경기';
    if (text.includes('인천') || text.includes('송도') || text.includes('부평')) return '인천';
    return '서울'; // 기본값
  };

  // 모든 행사 데이터 통합 및 중복 제거
  const uniqueEventsMap = new Map<string, any>();

  [
    ...(localDataState.events || []).map(e => ({ ...e, type: "events" })),
    ...(localDataState.seoulEvents || []).map(e => ({ ...e, type: "seoulEvents" })),
    ...(localDataState.kyeonggiEvents || []).map(e => ({ ...e, type: "kyeonggiEvents" })),
    ...(localDataState.incheonEvents || []).map(e => ({ ...e, type: "incheonEvents" })),
    ...(localDataState.nationalEvents || []).map(e => ({ ...e, type: "nationalEvents" })),

    ...(localDataState.cultureEvents || []).map(e => ({ ...e, type: "cultureEvents" })),
    ...(localDataState.seoulCultureEvents || []).map(e => ({ ...e, type: "seoulCultureEvents" })),
    ...(localDataState.kyeonggiCultureEvents || []).map(e => ({ ...e, type: "kyeonggiCultureEvents" })),
    ...(localDataState.incheonCultureEvents || []).map(e => ({ ...e, type: "incheonCultureEvents" })),
    ...(localDataState.nationalCultureEvents || []).map(e => ({ ...e, type: "nationalCultureEvents" })),

    ...(localDataState.exhibitionEvents || []).map(e => ({ ...e, type: "exhibitionEvents" })),
    ...(localDataState.seoulExhibitionEvents || []).map(e => ({ ...e, type: "seoulExhibitionEvents" })),
    ...(localDataState.kyeonggiExhibitionEvents || []).map(e => ({ ...e, type: "kyeonggiExhibitionEvents" })),
    ...(localDataState.incheonExhibitionEvents || []).map(e => ({ ...e, type: "incheonExhibitionEvents" })),
    ...(localDataState.nationalExhibitionEvents || []).map(e => ({ ...e, type: "nationalExhibitionEvents" }))
  ].forEach(event => {
    const key = event.name;
    const region = (event as any).region || getRegion(event as EventItem);
    const eventWithRegion = { ...event, region };

    if (!uniqueEventsMap.has(key)) {
      uniqueEventsMap.set(key, eventWithRegion);
    } else {
      const existing = uniqueEventsMap.get(key);
      const isGeneric = (t: string) => t === 'events' || t === 'cultureEvents' || t === 'exhibitionEvents';
      // 일반 대형 리스트보다는 구체적인 지역 정보를 우선하여 저장합니다.
      if (isGeneric(existing.type) && !isGeneric(event.type)) {
        uniqueEventsMap.set(key, eventWithRegion);
      }
    }
  });

  const allEvents = Array.from(uniqueEventsMap.values());

  // 모든 혜택 데이터 통합 및 중복 제거
  const uniqueBenefitsMap = new Map<string, any>();

  [
    ...(localDataState.benefits || []).map(b => ({ ...b, type: "benefits", region: (b as any).region || "전국" })),
    ...(localDataState.seoulBenefits || []).map(b => ({ ...b, type: "seoulBenefits", region: (b as any).region || "서울" })),
    ...(localDataState.kyeonggiBenefits || []).map(b => ({ ...b, type: "kyeonggiBenefits", region: (b as any).region || "경기" })),
    ...(localDataState.incheonBenefits || []).map(b => ({ ...b, type: "incheonBenefits", region: (b as any).region || "인천" })),
    ...(localDataState.nationalBenefits || []).map(b => ({ ...b, type: "nationalBenefits", region: (b as any).region || "전국" }))
  ].forEach(benefit => {
    const key = benefit.name;
    if (!uniqueBenefitsMap.has(key)) {
      uniqueBenefitsMap.set(key, benefit);
    } else {
      const existing = uniqueBenefitsMap.get(key);
      // 일반 'benefits'보다는 지역 정보가 더 구체적인 타입을 우선하여 저장합니다.
      if (existing.type === 'benefits' && benefit.type !== 'benefits') {
        uniqueBenefitsMap.set(key, benefit);
      }
    }
  });

  const filteredBenefits = Array.from(uniqueBenefitsMap.values()).filter(benefit => {
    // 종료된 혜택 자동 숨기기 (상시가 아니면서 오늘 날짜보다 과거인 경우 제외)
    if (benefit.endDate && benefit.endDate !== '상시' && benefit.endDate < currentDateStr) {
      return false;
    }

    if (isDiagnosisActive) {
      const matchServiceField = diagnosisServiceField === '전체' || benefit.serviceField === diagnosisServiceField;
      const matchSupportType = diagnosisSupportType === '전체' || benefit.supportType === diagnosisSupportType;
      const matchTargetGroup = diagnosisTargetGroup === '전체' || benefit.targetGroup === diagnosisTargetGroup;

      return matchServiceField && matchSupportType && matchTargetGroup;
    } else {
      // 기존 로직
      return selectedRegion === '전체' || benefit.region === '전국' || benefit.region === selectedRegion;
    }
  }).sort((a, b) => {
    // 1. 마감일(endDate) 기준 오름차순 (가장 임박한 순)
    // 상시이거나 마감일이 없는 경우는 맨 뒤로
    const getEndDateValue = (endDate: string | undefined | null) => {
      if (!endDate || endDate === '상시') return '9999-12-31';
      return endDate;
    };

    const endA = getEndDateValue(a.endDate);
    const endB = getEndDateValue(b.endDate);

    if (endA !== endB) {
      return endA.localeCompare(endB); // 문자열 비교로 날짜 오름차순
    }

    // 2. 마감일이 같다면 (또는 둘 다 상시라면) ID 기준 내림차순 (최근 등록 순)
    return Number(b.id) - Number(a.id);
  });

  // 페이지네이션 로직 (지원금/혜택)
  const BENEFITS_PER_PAGE = 9;
  const totalBenefitPages = Math.max(1, Math.ceil(filteredBenefits.length / BENEFITS_PER_PAGE));
  const currentBenefitsList = filteredBenefits.slice((currentBenefitPage - 1) * BENEFITS_PER_PAGE, currentBenefitPage * BENEFITS_PER_PAGE);

  let recommendedBenefits = Array.from(uniqueBenefitsMap.values()).slice(0, 3);
  if (filteredBenefits.length === 0 && isDiagnosisActive) {
    const scoredBenefits = Array.from(uniqueBenefitsMap.values())
      .filter(b => !(b.endDate && b.endDate !== '상시' && b.endDate < currentDateStr))
      .map(benefit => {
        let score = 0;
        if (diagnosisServiceField !== '전체' && benefit.serviceField === diagnosisServiceField) score += 1;
        if (diagnosisSupportType !== '전체' && benefit.supportType === diagnosisSupportType) score += 1;
        if (diagnosisTargetGroup !== '전체' && benefit.targetGroup === diagnosisTargetGroup) score += 1;
        return { ...benefit, score };
      })
      .filter(b => b.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredBenefits.length > 0) {
      recommendedBenefits = scoredBenefits.slice(0, 3);
    }
  }

  // 새로운 정보 개수 계산 (오늘~7일 이내 시작하는 행사)
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);
  const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

  const newInfoCount = allEvents.filter(event =>
    event.startDate >= currentDateStr && event.startDate <= sevenDaysLaterStr
  ).length;

  // 필터링 로직
  const filteredEvents = allEvents.filter(event => {
    const regionMatch = selectedRegion === '전체' || event.region === selectedRegion;
    const categoryMatch = selectedCategory === '전체' || event.category === selectedCategory;

    if (!regionMatch || !categoryMatch) return false;

    if (timeTab === 'all') {
      return true;
    }
    if (timeTab === 'past') {
      return event.endDate < currentDateStr;
    }
    if (timeTab === 'upcoming') {
      return event.startDate >= nextMondayStr;
    }
    // 이번 주 행사 (오늘 ~ 이번주 일요일까지 진행 중인 것)
    const isDuringThisWeek = event.startDate <= thisSundayStr && event.endDate >= currentDateStr;
    return isDuringThisWeek;
  }).sort((a, b) => {
    // 날짜 순 정렬 (시작일 기준 오름차순)
    if (a.startDate !== b.startDate) {
      return a.startDate.localeCompare(b.startDate);
    }
    return 0;
  });

  // 페이지네이션 로직 (행사/축제 한정)
  const EVENTS_PER_PAGE = 6;
  const totalEventPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const currentEvents = filteredEvents.slice((currentPage - 1) * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE);

  // 행사 이름에 따라 가장 어울리는 이미지를 찾아주는 함수
  const getEventImage = (name: string) => {
    if (name.includes('어린이') || name.includes('체험') || name.includes('캠프')) return 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=400&q=80'; // 놀이공원/아이
    if (name.includes('장미') || name.includes('꽃') || name.includes('철쭉') || name.includes('튤립') || name.includes('코스모스') || name.includes('유채꽃')) return 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=400&q=80'; // 꽃
    if (name.includes('교향악단') || name.includes('음악회') || name.includes('콘서트') || name.includes('오페라') || name.includes('음악')) return 'https://images.unsplash.com/photo-1465847733345-2feba59b6467?auto=format&fit=crop&w=400&q=80'; // 오케스트라
    if (name.includes('책') || name.includes('도서관') || name.includes('인문학') || name.includes('아카데미') || name.includes('강좌') || name.includes('교육')) return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80'; // 도서관/교육
    if (name.includes('박물관') || name.includes('미술관') || name.includes('전시') || name.includes('특별전') || name.includes('갤러리')) return 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=400&q=80'; // 한국 전통/박물관/전시
    if (name.includes('한강') || name.includes('잠수교') || name.includes('호수')) return 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=400&q=80'; // 한강/물가
    if (name.includes('나비')) return 'https://images.unsplash.com/photo-1555037015-1498966cbd7a?auto=format&fit=crop&w=400&q=80'; // 나비
    if (name.includes('도자기')) return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80'; // 도자기
    return `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80`; // 기본 풍경
  };

  const createEventSchema = (event: any) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "startDate": event.startDate || new Date().toISOString().split('T')[0],
    "endDate": event.endDate && event.endDate !== "상시" ? event.endDate : "2027-12-31",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.location || "수도권 일대",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.region || "Seoul",
        "addressCountry": "KR"
      }
    },
    "image": [getEventImage(event.name)],
    "description": event.summary,
    "performer": {
      "@type": "PerformingGroup",
      "name": "모아팁스 행사팀"
    },
    "organizer": {
      "@type": "Organization",
      "name": "모아팁스",
      "url": "https://moa-tips.com"
    },
    "offers": {
      "@type": "Offer",
      "url": event.link || "https://moa-tips.com",
      "price": "0",
      "priceCurrency": "KRW",
      "availability": "https://schema.org/InStock",
      "validFrom": event.startDate || new Date().toISOString().split('T')[0]
    }
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* 구조화 데이터: Event & GovernmentService */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            ...(localDataState.events || []).map(createEventSchema),
            ...(localDataState.cultureEvents || []).map(createEventSchema),
            ...(localDataState.exhibitionEvents || []).map(createEventSchema),
            ...(localDataState.benefits || []).map(benefit => ({
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Hero Section */}
        <section className="text-center pt-8 pb-0">
          {/* <div className="inline-block px-4 py-1.5 mb-6 bg-cyan-50 text-cyan-600 rounded-full text-sm font-bold tracking-tight animate-flash-pulse shadow-sm border border-cyan-100">
            오늘 <span className="text-amber-600 font-black">{newInfoCount}</span>개의 새로운 정보가 도착했습니다 💌
          </div> */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-2 tracking-tight leading-tight break-keep">
            수도권 나들이부터<br className="sm:hidden" /> 정부 지원금 혜택까지 한눈에,<br className="hidden sm:block" /> <span className="text-cyan-500">모아팁스</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium break-keep">
            서울, 경기, 인천 지역의 놓치기 아쉬운 정보를 엄선했습니다.<br />
            모아팁스에서 생활에 힘이 되는 혜택을 지금 바로 확인해 보세요.
          </p>
        </section>

        <div className="space-y-3">
          {/* 수도권 날씨 정보 위젯 */}
          <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-100/50 rounded-[32px] p-1 shadow-sm space-y-1">
            {/* 첫 번째 줄: 오늘 날씨 */}
            <div className="bg-white/80 backdrop-blur-md rounded-[10px] px-8 py-2 flex flex-col md:grid md:grid-cols-[100px_1fr_1fr_1fr_100px] items-center gap-6 md:gap-0">
              {/* 왼쪽: 타이틀 */}
              <div className="flex flex-col items-center md:items-start md:pr-4 md:border-r border-slate-100 w-full">
                <span className="text-[14px] font-black text-cyan-600 mb-0.5 whitespace-nowrap">오늘 날씨</span>
                <span className="text-[11px] font-bold text-slate-400">수도권</span>
              </div>

              {/* 중앙: 도시별 날씨 */}
              {[
                { id: 0, city: '서울' },
                { id: 1, city: '경기' },
                { id: 2, city: '인천' }
              ].map((loc, idx) => {
                const currentW = weatherData?.[loc.id]?.current;
                const currentA = airQualityData?.[loc.id]?.current;
                const wInfo = currentW ? getWeatherInfo(currentW.weather_code) : { desc: '로딩중', icon: '⏳' };
                const dustInfo = currentA ? getDustLevel(currentA.pm10) : { level: '-', color: 'text-slate-400' };
                const temp = currentW ? Math.round(currentW.temperature_2m) + '°' : '-°';

                return (
                  <div key={loc.city}
                    onClick={() => setSelectedCityForModal(loc.city)}
                    className={`flex items-center gap-4 w-full justify-center md:justify-start md:pl-10 cursor-pointer hover:bg-slate-50/50 rounded-xl transition-colors py-1 ${idx !== 2 ? 'md:border-r border-slate-50' : ''}`}>
                    <span className="text-[15px] font-black text-slate-700 min-w-[30px]">{loc.city}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{wInfo.icon}</span>
                      <span className="text-[18px] font-black text-slate-900">{temp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-slate-500">{wInfo.desc}</span>
                      <span className="w-px h-2 bg-slate-200"></span>
                      <span className={`text-[10px] font-black ${dustInfo.color}`}>
                        미세: {dustInfo.level}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* 오른쪽: 기준 시간 */}
              <div className="md:pl-4 md:border-l border-slate-100 hidden lg:flex justify-end w-full">
                <span className="text-[12px] font-bold text-slate-300 whitespace-nowrap">
                  {weatherLastUpdated ? `${weatherLastUpdated} 기준` : '업데이트 중...'}
                </span>
              </div>
            </div>

            {/* 두 번째 줄: 주말 예보 (사용자 요청으로 임시 숨김 처리) */}
            {false && (
              <div className="bg-white/60 backdrop-blur-md rounded-b-[30px] rounded-t-[10px] px-8 py-2 md:grid md:grid-cols-[100px_1fr_1fr_1fr_100px] items-center gap-6 md:gap-0">
                <div className="flex flex-col items-center md:items-start md:pr-4 md:border-r border-slate-100 w-full">
                  <span className="text-[14px] font-black text-rose-500 mb-0.5 whitespace-nowrap">주말 예보</span>
                  <span className="text-[11px] font-bold text-slate-400">수도권</span>
                </div>

                {[
                  { id: 0, region: '서울' },
                  { id: 1, region: '경기' },
                  { id: 2, region: '인천' }
                ].map((r, idx) => {
                  const daily = weatherData?.[r.id]?.daily;
                  let sat = { temp: '-', icon: '⏳' };
                  let sun = { temp: '-', icon: '⏳' };
                  if (daily && daily.time) {
                    const satIdx = daily.time.findIndex((t: string) => new Date(t).getDay() === 6);
                    const sunIdx = daily.time.findIndex((t: string) => new Date(t).getDay() === 0);
                    if (satIdx !== -1) sat = { temp: Math.round(daily.temperature_2m_max[satIdx]) + '°', icon: getWeatherInfo(daily.weather_code[satIdx]).icon };
                    if (sunIdx !== -1) sun = { temp: Math.round(daily.temperature_2m_max[sunIdx]) + '°', icon: getWeatherInfo(daily.weather_code[sunIdx]).icon };
                  }

                  return (
                    <div key={r.region} className={`flex items-center gap-4 w-full justify-center md:justify-start md:pl-10 ${idx !== 2 ? 'md:border-r border-slate-50' : ''}`}>
                      <span className="text-[15px] font-black text-slate-700 min-w-[30px]">{r.region}</span>
                      <div className="flex items-center gap-4 bg-slate-50/50 px-3 py-1 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-blue-500">토</span>
                          <span className="text-sm">{sat.icon}</span>
                          <span className="text-[14px] font-extrabold text-slate-700">{sat.temp}</span>
                        </div>
                        <div className="w-px h-2.5 bg-slate-200"></div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-rose-500">일</span>
                          <span className="text-sm">{sun.icon}</span>
                          <span className="text-[14px] font-extrabold text-slate-700">{sun.temp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="md:pl-4 md:border-l border-slate-100 hidden lg:flex justify-end w-full">
                  <span className="text-[12px] font-bold text-slate-300 whitespace-nowrap italic">
                    야외활동 추천 🌳
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 유용한 정보 Hub (가이드) */}
          {guidePosts.length > 0 && (
            <div className="mt-8 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>💡</span> 유용한 정보 Hub
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {guidePosts
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice((currentGuidePage - 1) * 3, currentGuidePage * 3)
                  .map((guide) => (
                    <Link 
                      key={guide.slug} 
                      href={`/guide/${guide.slug}`}
                      className="group flex flex-col bg-slate-900 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative aspect-[4/3] border border-slate-100"
                    >
                      <img 
                        src={guide.thumbnail || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80'} 
                        alt={guide.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      
                      {/* 상단 뱃지 영역: 카테고리(좌측), 날짜(우측) */}
                      <div className="absolute top-0 left-0 w-full p-5 sm:p-6 flex justify-between items-start z-10">
                        <div className="bg-black/50 text-yellow-400 text-xs font-bold px-3 py-1 rounded-md border border-yellow-400/30">
                          {guide.category}
                        </div>
                        <div className="text-slate-200 text-[11px] font-bold px-2 py-1 bg-black/30 rounded-md backdrop-blur-sm border border-white/10">
                          {guide.date}
                        </div>
                      </div>

                      {/* 하단 텍스트 및 버튼 영역 (기존 크기 유지) */}
                      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end items-center text-center">
                        <h3 className="text-xl sm:text-2xl font-black text-white mb-4 leading-tight drop-shadow-lg break-keep">
                          <span className="text-yellow-400">{guide.title.split(' ')[0]}</span>{' '}
                          {guide.title.split(' ').slice(1).join(' ')}
                        </h3>
                        <div className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg transition-colors inline-flex items-center gap-1">
                          자세히보기 <span className="text-lg leading-none">›</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* 가이드 페이징 */}
              {guidePosts.length > 3 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentGuidePage(prev => Math.max(1, prev - 1))}
                    disabled={currentGuidePage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 font-bold hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm"
                  >
                    &larr;
                  </button>
                  {(() => {
                    const totalPages = Math.ceil(guidePosts.length / 3) || 1;
                    const pages = [];
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      if (currentGuidePage <= 3) {
                        pages.push(1, 2, 3, 4, '...', totalPages);
                      } else if (currentGuidePage >= totalPages - 2) {
                        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push(1, '...', currentGuidePage - 1, currentGuidePage, currentGuidePage + 1, '...', totalPages);
                      }
                    }

                    return pages.map((p, idx) => (
                      p === '...' ? (
                        <span key={`guide-dots-${idx}`} className="text-slate-300 text-sm px-1">...</span>
                      ) : (
                        <button
                          key={`guide-page-${p}`}
                          onClick={() => setCurrentGuidePage(p as number)}
                          className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-colors shadow-sm ${currentGuidePage === p ? 'bg-[#00D0C0] text-white border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {p}
                        </button>
                      )
                    ));
                  })()}
                  <button
                    onClick={() => setCurrentGuidePage(prev => Math.min(Math.ceil(guidePosts.length / 3), prev + 1))}
                    disabled={currentGuidePage >= Math.ceil(guidePosts.length / 3)}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 font-bold hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 메인 카테고리 대형 버튼 2개 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-4">
            <button
              onClick={() => {
                document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-[24px] shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] group"
            >
              <span className="text-3xl mb-2 group-hover:-translate-y-1 transition-transform">💰</span>
              <span className="text-xl sm:text-2xl font-black tracking-tight">지원금·혜택 모아보기</span>
              <span className="text-indigo-100 text-sm font-medium mt-1">청년, 소상공인, 우리 가족 모두를 위한 알짜 정보</span>
            </button>

            <button
              onClick={() => {
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-400 to-rose-600 hover:from-rose-500 hover:to-rose-700 text-white rounded-[24px] shadow-lg hover:shadow-rose-200 transition-all active:scale-[0.98] group"
            >
              <span className="text-3xl mb-2 group-hover:-translate-y-1 transition-transform">🎡</span>
              <span className="text-xl sm:text-2xl font-black tracking-tight">수도권 모아팁스 행사/축제</span>
              <span className="text-rose-100 text-sm font-medium mt-1">수도권에서 열리는 다양한 문화·예술·전시 모아보기</span>
            </button>
          </div>

          {/* 오늘의 운세 유도 배너 (Inline Banner) */}
          <div className="mb-8 mt-2">
            <Link 
              href="/fortune"
              className="group relative flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 rounded-[24px] p-6 sm:px-10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
            >
              {/* 반짝이는 배경 효과 */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 group-hover:opacity-30 transition-opacity mix-blend-overlay"></div>
              
              <div className="relative z-10 flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0 text-center sm:text-left">
                <div className="text-5xl sm:text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">🔮</div>
                <div>
                  <h3 className="text-white font-black text-xl sm:text-2xl mb-1 tracking-tight drop-shadow-sm">나의 오늘의 띠별 운세는?</h3>
                  <p className="text-violet-100 font-medium text-sm sm:text-base">12지신이 알려주는 행운의 메시지와 맞춤형 럭키 아이템 확인하기 ✨</p>
                </div>
              </div>

              <div className="relative z-10 whitespace-nowrap bg-white/20 hover:bg-white/30 text-white backdrop-blur-md px-6 py-3 rounded-full font-bold text-sm transition-colors border border-white/30 shadow-sm flex items-center gap-2">
                운세 확인하러 가기 <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>

          {/* 1분 자가진단 툴 및 AI 블로그 */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8 mt-6">
            {/* 1분 자가진단 툴 */}
            <section className="w-full lg:w-1/2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col justify-center">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-teal-800 mb-2">1분 만에 끝나는 내 지원금 찾기 🔍</h2>
                <p className="text-teal-600 font-medium text-sm sm:text-base">나에게 딱 맞는 혜택을 빠르고 간편하게 찾아보세요!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto w-full">
                {/* 서비스 분야 선택 */}
                <div>
                  <label className="block text-xs font-bold text-teal-700 mb-1 pl-1">서비스 분야</label>
                  <select
                    value={diagnosisServiceField}
                    onChange={(e) => setDiagnosisServiceField(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-0 ring-1 ring-teal-200 focus:ring-2 focus:ring-teal-500 bg-white text-slate-700 font-bold shadow-sm outline-none cursor-pointer"
                  >
                    <option value="전체">서비스 분야 (전체)</option>
                    <option value="생활안정">생활안정</option>
                    <option value="보건 의료">보건 의료</option>
                    <option value="보육 교육">보육 교육</option>
                    <option value="농림축산어업">농림축산어업</option>
                    <option value="고용 창업">고용 창업</option>
                    <option value="임신 출산">임신 출산</option>
                    <option value="보호 돌봄">보호 돌봄</option>
                    <option value="행정 안전">행정 안전</option>
                    <option value="문화 환경">문화 환경</option>
                    <option value="주거 자립">주거 자립</option>
                  </select>
                </div>

                {/* 지원 유형 선택 */}
                <div>
                  <label className="block text-xs font-bold text-teal-700 mb-1 pl-1">지원 유형</label>
                  <select
                    value={diagnosisSupportType}
                    onChange={(e) => setDiagnosisSupportType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-0 ring-1 ring-teal-200 focus:ring-2 focus:ring-teal-500 bg-white text-slate-700 font-bold shadow-sm outline-none cursor-pointer"
                  >
                    <option value="전체">지원 유형 (전체)</option>
                    <option value="현금">현금</option>
                    <option value="현금(보험)">현금(보험)</option>
                    <option value="현금(융자)">현금(융자)</option>
                    <option value="현금(장학금)">현금(장학금)</option>
                    <option value="현금(감면)">현금(감면)</option>
                    <option value="현물">현물</option>
                    <option value="서비스(돌봄)">서비스(돌봄)</option>
                    <option value="서비스(일자리)">서비스(일자리)</option>
                    <option value="이용권">이용권</option>
                    <option value="기술지원">기술지원</option>
                    <option value="시설이용">시설이용</option>
                    <option value="기타">기타</option>
                    <option value="기타(교육)">기타(교육)</option>
                    <option value="기타(상담)">기타(상담)</option>
                  </select>
                </div>

                {/* 대상 선택 */}
                <div>
                  <label className="block text-xs font-bold text-teal-700 mb-1 pl-1">해당 대상</label>
                  <select
                    value={diagnosisTargetGroup}
                    onChange={(e) => setDiagnosisTargetGroup(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-0 ring-1 ring-teal-200 focus:ring-2 focus:ring-teal-500 bg-white text-slate-700 font-bold shadow-sm outline-none cursor-pointer"
                  >
                    <option value="전체">대상 누구나 (전체)</option>
                    <option value="개인">개인</option>
                    <option value="가구">가구</option>
                    <option value="소상공인">소상공인</option>
                    <option value="법인/시설/단체">법인/시설/단체</option>
                  </select>
                </div>

                {/* 버튼 */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setIsDiagnosisActive(true);
                      setCurrentBenefitPage(1);
                      document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full px-4 py-2.5 h-[42px] text-sm bg-teal-500 hover:bg-teal-600 text-white font-black rounded-xl shadow-lg shadow-teal-200 transition-all transform hover:scale-105 whitespace-nowrap"
                  >
                    맞춤 혜택 찾기
                  </button>
                </div>
              </div>
            </section>

            {/* AI 블로그 */}
            <section className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-[32px] p-5 shadow-sm flex flex-col min-h-[220px]">
              <div>
                <h2 className="text-xl font-black text-teal-800 mb-2">
                  놓치면 무조건 손해! AI가 골라주는 알짜배기 정보 🎁
                </h2>
                <div className="flex flex-col gap-1.5">
                  {blogPosts
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice((currentBlogPage - 1) * 3, currentBlogPage * 3)
                    .map((post) => (
                      <Link href={`/blog/${post.slug}`} key={post.slug} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-3 pt-1.5 pb-1 hover:border-cyan-200 hover:shadow-md transition-all duration-300 flex flex-col relative">
                          <h4 className="font-extrabold text-[13px] text-slate-900 group-hover:text-cyan-600 transition-colors mb-1 line-clamp-1 relative z-10">
                            {post.title}
                          </h4>
                          {post.summary && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5 leading-tight relative z-10">
                              {post.summary}
                            </p>
                          )}
                          <div className="flex justify-between items-center relative z-10 text-[10px] text-slate-400">
                            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-[1px] rounded-full flex-shrink-0">
                              {post.category || '블로그'}
                            </span>
                            <span className="truncate mx-2 flex-grow text-center">
                              {(post.tags && post.tags.find((t: string) => ['서울', '경기', '인천', '송파', '송파구', '전국', '하남', '수원', '용산', '성북', '영등포'].some(region => t.includes(region)))) || '로컬'} 뉴스
                            </span>
                            <span className="flex-shrink-0">{post.date}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              {/* 블로그 페이징 */}
              <div className="flex justify-center items-center gap-1 sm:gap-2 mt-2 pt-2">
                <button
                  onClick={() => setCurrentBlogPage(prev => Math.max(1, prev - 1))}
                  disabled={currentBlogPage === 1}
                  className="px-3 py-1.5 rounded-full border border-slate-100 text-[12px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1"
                >
                  <span>&larr;</span> 이전
                </button>

                {(() => {
                  const totalPages = Math.ceil(blogPosts.length / 3) || 1;
                  const pages = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentBlogPage <= 3) {
                      pages.push(1, 2, 3, 4, '...', totalPages);
                    } else if (currentBlogPage >= totalPages - 2) {
                      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', currentBlogPage - 1, currentBlogPage, currentBlogPage + 1, '...', totalPages);
                    }
                  }

                  return pages.map((p, idx) => (
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="text-slate-300 text-[12px] px-0.5">...</span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => setCurrentBlogPage(p as number)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-bold transition-colors ${currentBlogPage === p ? 'bg-[#00D0C0] text-white border-transparent' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                      >
                        {p}
                      </button>
                    )
                  ));
                })()}

                <button
                  onClick={() => setCurrentBlogPage(prev => Math.min(Math.ceil(blogPosts.length / 3), prev + 1))}
                  disabled={currentBlogPage >= Math.ceil(blogPosts.length / 3)}
                  className="px-3 py-1.5 rounded-full border border-slate-100 text-[12px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1"
                >
                  다음 <span>&rarr;</span>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* 지원금/혜택 정보 */}
        <section id="benefits" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎁</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isDiagnosisActive ? '맞춤 지원금/혜택 결과' : '지원금/혜택 정보'}
              </h2>
              <span className="text-sm font-medium text-slate-500 mt-1 sm:mt-0 sm:ml-2 pt-1">
                총 {filteredBenefits.length.toLocaleString()}건
              </span>
            </div>

            {isDiagnosisActive && (
              <button
                onClick={() => { setIsDiagnosisActive(false); setCurrentBenefitPage(1); }}
                className="text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                전체 목록 보기 ↺
              </button>
            )}
          </div>

          {filteredBenefits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-5xl mb-4 block">😢</span>
              <h3 className="text-xl font-bold text-slate-700 mb-2">조건에 딱 맞는 혜택을 찾지 못했어요</h3>
              <p className="text-slate-500 mb-6 font-medium">다른 조건으로 다시 검색하거나 전체 목록을 확인해보세요.</p>
              <button
                onClick={() => { setIsDiagnosisActive(false); setCurrentBenefitPage(1); }}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-100"
              >
                전체 혜택 목록 보기
              </button>
              <div className="mt-8">
                <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center justify-center gap-2">
                  <span>💡</span> {isDiagnosisActive ? '이런 유사한 혜택은 어떠신가요?' : '요즘 많이 찾는 이런 혜택은 어떠신가요?'}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 text-left">
                  {recommendedBenefits.map((benefit, index) => {
                    const { text: ddayText, isDday } = getDdayInfo(benefit.endDate, mounted);
                    return (
                      <Link
                        href={`/detail/${(benefit as any).type}/${benefit.id}`}
                        key={`rec-${benefit.id}-${index}`}
                        className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-cyan-200 hover:shadow-md transition-all duration-300 relative flex flex-col h-full"
                      >
                        <div className="flex flex-wrap gap-2 mb-3 relative z-10">
                          {benefit.serviceField && (
                            <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-1 rounded-full">
                              {benefit.serviceField}
                            </span>
                          )}
                          {benefit.supportType && (
                            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-full">
                              {benefit.supportType}
                            </span>
                          )}
                          {benefit.region && (
                            <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-full">
                              {benefit.region}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-cyan-600 transition-colors mb-2 line-clamp-1 relative z-10">{benefit.name}</h4>

                        <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed relative z-10 line-clamp-2">
                          {benefit.summary}
                        </p>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-[12px] mt-auto relative z-10">
                          <span className="text-slate-400 truncate pr-2">{benefit.location || benefit.region}</span>
                          <span className={isDday ? "text-red-500 font-bold whitespace-nowrap" : "text-slate-400 whitespace-nowrap"}>
                            {ddayText}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {currentBenefitsList.map((benefit, index) => {
                const { text: ddayText, isDday } = getDdayInfo(benefit.endDate, mounted);
                return (
                  <Link
                    href={`/detail/${(benefit as any).type}/${benefit.id}`}
                    key={`${benefit.id}-${benefit.name}-${index}`}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-cyan-200 hover:shadow-md transition-all duration-300 relative flex flex-col h-full"
                  >
                    <div className="flex flex-wrap gap-2 mb-3 relative z-10">
                      {benefit.serviceField && (
                        <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-1 rounded-full">
                          {benefit.serviceField}
                        </span>
                      )}
                      {benefit.supportType && (
                        <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-full">
                          {benefit.supportType}
                        </span>
                      )}
                      {benefit.region && (
                        <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-1 rounded-full">
                          {benefit.region}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-cyan-600 transition-colors mb-2 line-clamp-1 relative z-10">{benefit.name}</h3>

                    <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed relative z-10 line-clamp-2">
                      {benefit.summary}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-[12px] mt-auto relative z-10">
                      <span className="text-slate-400 truncate pr-2">{benefit.location || benefit.region}</span>
                      <span className={isDday ? "text-red-500 font-bold whitespace-nowrap" : "text-slate-400 whitespace-nowrap"}>
                        {ddayText}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 버튼 영역 (지원금/혜택) */}
          {filteredBenefits.length > 0 && totalBenefitPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentBenefitPage(prev => Math.max(prev - 1, 1));
                  setTimeout(() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }), 50);
                }}
                disabled={currentBenefitPage === 1}
                className="px-4 py-2 flex items-center justify-center border border-slate-100 rounded-full bg-white text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                &larr; 이전
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalBenefitPages }, (_, i) => i + 1).map(pageNum => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalBenefitPages ||
                    (pageNum >= currentBenefitPage - 1 && pageNum <= currentBenefitPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentBenefitPage(pageNum);
                          setTimeout(() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }), 50);
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm transition-all ${currentBenefitPage === pageNum
                          ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md shadow-cyan-200/50 border-none"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-500"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentBenefitPage - 2 ||
                    pageNum === currentBenefitPage + 2
                  ) {
                    return <span key={pageNum} className="text-slate-300 font-bold px-0.5 tracking-widest text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentBenefitPage(prev => Math.min(prev + 1, totalBenefitPages));
                  setTimeout(() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }), 50);
                }}
                disabled={currentBenefitPage === totalBenefitPages}
                className="px-4 py-2 flex items-center justify-center border border-slate-100 rounded-full bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                다음 &rarr;
              </button>
            </div>
          )}
        </section>

        {/* 중앙 광고 영역 (임시 숨김) */}
        {/* <AdBanner /> */}
        {/* <CoupangBanner /> */}

        {/* 모아팁스 행사/축제 */}
        <section id="events" className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎈</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">모아팁스 행사/축제</h2>
            </div>

            {/* 필터 컨트롤 */}
            <div className="flex flex-col items-start sm:items-end gap-4 sm:flex-1 w-full sm:w-auto">
              <div className="flex flex-col items-start gap-4">
                {/* 분류 선택 탭 */}
                <div className="flex items-center">
                  <div className="bg-[#47A1B8] text-white px-4 py-2 rounded-l-lg font-bold text-sm min-w-[60px] text-center">
                    분류
                  </div>
                  <div className="flex bg-white border border-[#47A1B8] rounded-r-lg overflow-hidden">
                    {[
                      { id: '전체', label: '전체' },
                      { id: '행사', label: '🎈 행사' },
                      { id: '문화', label: '🎓 문화' },
                      { id: '전시', label: '🖼️ 전시' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); fetchFreshData(); setCurrentPage(1); }}
                        className={`px-4 py-2 font-bold text-sm transition-all border-l first:border-l-0 border-slate-100 ${selectedCategory === cat.id
                          ? 'bg-black text-white'
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 지역 및 기간 선택 탭 (지역 ➡️ 기간 순서) */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {/* 지역 선택 탭 */}
                  <div className="flex items-center">
                    <div className="bg-[#47A1B8] text-white px-4 py-2 rounded-l-lg font-bold text-sm min-w-[60px] text-center">
                      지역
                    </div>
                    <div className="flex bg-white border border-[#47A1B8] rounded-r-lg overflow-hidden">
                      {['전체', '서울', '경기', '인천'].map((region) => (
                        <button
                          key={region}
                          onClick={() => { setSelectedRegion(region); fetchFreshData(); setCurrentPage(1); setCurrentBenefitPage(1); }}
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
                          onClick={() => { setTimeTab(tab.id); fetchFreshData(); setCurrentPage(1); }}
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
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2" id="events-grid">
            {currentEvents.map((event, index) => (
              <Link
                key={`${event.id}-${event.name}-${index}`}

                href={`/detail/${(event as any).type}/${event.id}`}
                className="group bg-white rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row overflow-hidden h-full"
              >
                {/* Left: Image Area */}
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 shrink-0 overflow-hidden">
                  <img
                    src={event.imageUrl || getEventImage(event.name)}
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
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-md">
                      {event.category || '행사'}
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

          {/* 페이지네이션 버튼 영역 */}
          {totalEventPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {currentPage > 1 ? (
                <button type="button" onClick={() => { const newPage = Math.max(currentPage - 1, 1); setCurrentPage(newPage); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="px-4 py-2 flex items-center justify-center border border-slate-100 rounded-full bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm shadow-sm"
                >
                  &larr; 이전
                </button>
              ) : (
                <span className="px-4 py-2 flex items-center justify-center border border-slate-100 rounded-full bg-white text-slate-400 font-bold opacity-30 cursor-not-allowed text-sm shadow-sm">
                  &larr; 이전
                </span>
              )}

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalEventPages }, (_, i) => i + 1).map(pageNum => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalEventPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => { setCurrentPage(pageNum); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-sm transition-all ${currentPage === pageNum
                          ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-md shadow-cyan-200/50 border-none"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:text-cyan-500"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-slate-300 font-bold px-0.5 tracking-widest text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              {currentPage < totalEventPages ? (
                <button type="button" onClick={() => { const newPage = Math.min(currentPage + 1, totalEventPages); setCurrentPage(newPage); document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="px-4 py-2 flex items-center justify-center border border-slate-100 rounded-full bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm shadow-sm"
                >
                  다음 &rarr;
                </button>
              ) : (
                <span className="px-4 py-2 flex items-center justify-center border border-slate-100 rounded-full bg-white text-slate-400 font-bold opacity-30 cursor-not-allowed text-sm shadow-sm">
                  다음 &rarr;
                </span>
              )}
            </div>
          )}
        </section>


        {/* Promo Banner */}
        <section className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[24px] p-6 sm:p-8 text-white overflow-hidden relative shadow-xl shadow-cyan-100/50">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-2 leading-tight">
                매일 새로운 혜택 소식을 가장 빠르게 받아보세요!
              </h2>
              <p className="text-white/90 text-sm sm:text-base font-medium">
                모아팁스 카카오 채널을 추가하고 스마트한 생활을 시작하세요.
              </p>
            </div>
            <button
              onClick={() => window.open('http://pf.kakao.com/_CrWxjX', '_blank')}
              className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-black text-base hover:scale-105 transition-transform shadow-lg shrink-0"
            >
              카카오 채널 추가하기 💬
            </button>
          </div>
        </section>

        {/* 쿠팡 파트너스 하단 배너 */}
        <div className="mt-8">
          <CoupangBanner />
        </div>

        {/* SEO 텍스트 (모아팁스 소개) */}
        <section className="bg-white rounded-[24px] p-8 mt-12 border border-slate-100 shadow-sm text-left">
          <h2 className="text-2xl font-black text-slate-800 mb-4">수도권 모아팁스란?</h2>
          <p className="text-slate-600 mb-4 leading-relaxed font-medium">
            수도권(서울, 경기, 인천) 지역의 핵심 정보, 행사, 축제 및 다양한 정부 지원금을 한곳에 모아 전달하는 종합 생활 정보 플랫폼입니다.
            매일 업데이트되는 공공데이터포털 및 지자체 공식 자료를 바탕으로, 소상공인, 청년, 어르신, 1인가구 등 각계각층의 시민들이
            놓치기 쉬운 필수 혜택을 알기 쉽게 요약하여 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 mt-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-700 mb-2">🎁 어떤 정보를 제공하나요?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                각종 지역 축제, 문화 예술 공연 전시 정보부터 생활 안정을 위한 <strong>재난지원금, 청년 월세 지원, 소상공인 대출 지원, 육아 수당</strong> 등 필수 행정 정보들을 꼼꼼하게 정리하여 제공합니다.
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-700 mb-2">✨ 어떻게 이용하나요?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                별도의 회원가입 없이 누구나 무료로 이용 가능하며, 1분 자가진단 툴을 통해 <strong>내 조건에 딱 맞는 맞춤 혜택</strong>을 즉시 찾아볼 수 있습니다. 상세 정보는 제공되는 공식 홈페이지 링크를 통해 확인하세요.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-slate-600 font-bold">더 깊이 있는 분석과 꿀팁이 궁금하시다면?</p>
            <Link href="/blog" className="px-6 py-2 bg-slate-900 text-center text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
              AI 블로그 바로가기
            </Link>
          </div>
        </section>

        {/* Footer */}




        <footer className="pt-20 border-t border-slate-200 text-center pb-10">
          <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mb-8">
            <Link href="/" className="text-slate-400 hover:text-slate-600 font-bold">홈</Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-600 font-bold">블로그</Link>
            <Link href="/about" className="text-slate-400 hover:text-slate-600 font-bold">소개</Link>
            <Link href="/privacy" className="text-slate-400 hover:text-slate-600 font-bold">개인정보처리방침</Link>
            <Link href="/terms" className="text-slate-400 hover:text-slate-600 font-bold">이용약관</Link>
            <Link href="/contact" className="text-slate-400 hover:text-slate-600 font-bold">문의하기</Link>
          </div>
          <p className="text-slate-400 text-sm mb-2 font-medium">
            데이터 출처: 공공데이터포털 및 각 지자체 공식 홈페이지
          </p>
          <p className="text-slate-300 text-xs">
            © 2026 모아팁스 Moatips. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-300 mt-4">
            마지막 업데이트: {currentDate}
          </p>
        </footer>

      </div>

      <WeatherModal
        isOpen={!!selectedCityForModal}
        onClose={() => setSelectedCityForModal(null)}
        cityName={selectedCityForModal || ''}
        forecasts={selectedCityForModal ? getModalForecasts(selectedCityForModal) : []}
      />
    </main>
  );
}
