"use client";

import React, { useEffect, useState, useRef } from 'react';
import BackButton from '@/components/BackButton';

interface FortuneCardData {
  type: string;
  general: string;
  lucky_item: string;
  coupang_url?: string;
  coupang_urls?: string[];
}

interface FortuneData {
  date: string;
  cards?: FortuneCardData[];
}

const ZODIAC_SIGNS = [
  { name: '쥐띠', icon: '🐭', color: 'from-slate-400 to-slate-500' },
  { name: '소띠', icon: '🐮', color: 'from-stone-400 to-stone-500' },
  { name: '호랑이띠', icon: '🐯', color: 'from-orange-400 to-orange-500' },
  { name: '토끼띠', icon: '🐰', color: 'from-pink-400 to-pink-500' },
  { name: '용띠', icon: '🐲', color: 'from-emerald-400 to-emerald-600' },
  { name: '뱀띠', icon: '🐍', color: 'from-green-400 to-green-600' },
  { name: '말띠', icon: '🐴', color: 'from-amber-400 to-amber-600' },
  { name: '양띠', icon: '🐑', color: 'from-zinc-400 to-zinc-500' },
  { name: '원숭이띠', icon: '🐵', color: 'from-red-400 to-red-600' },
  { name: '닭띠', icon: '🐔', color: 'from-yellow-400 to-yellow-600' },
  { name: '개띠', icon: '🐶', color: 'from-orange-300 to-orange-500' },
  { name: '돼지띠', icon: '🐷', color: 'from-rose-400 to-rose-500' },
];

export default function FortunePage() {
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZodiac, setSelectedZodiac] = useState<{name: string, icon: string} | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/today_fortune.json?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('Fortune data not found');
        return res.json();
      })
      .then(data => {
        setFortuneData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleZodiacClick = (zodiac: {name: string, icon: string}) => {
    setSelectedZodiac(zodiac);
    
    // Smooth scroll down to result after a short delay to allow DOM to render
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const getCardForZodiac = (zodiacName: string): FortuneCardData | null => {
    if (!fortuneData || !fortuneData.cards) return null;
    
    // 1. Try to find an exact match by type (e.g. "쥐띠")
    const match = fortuneData.cards.find(c => c.type === zodiacName || c.type.includes(zodiacName.replace('띠', '')));
    if (match) return match;
    
    // 2. Fallback: if data is still in Tarot format (3 items), just hash the name to pick one randomly but consistently
    const hash = zodiacName.charCodeAt(0) % fortuneData.cards.length;
    return fortuneData.cards[hash];
  };

  const shareToKakao = () => {
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const Kakao = (window as any).Kakao;
      if (!Kakao.isInitialized()) {
        const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
        if (!appKey || appKey === '나중에_입력') {
          alert('카카오 공유하기를 사용하려면 NEXT_PUBLIC_KAKAO_APP_KEY를 환경변수에 등록해주세요. (카카오 디벨로퍼스 JavaScript 키)');
          return;
        }
        Kakao.init(appKey);
      }

      const selectedCard = selectedZodiac ? getCardForZodiac(selectedZodiac.name) : null;
      const shareTitle = selectedZodiac ? `🔮 ${selectedZodiac.icon} ${selectedZodiac.name} 오늘의 운세 결과는?` : '🔮 나의 오늘의 운세 결과는?';

      const shareDescription = selectedCard && fortuneData
        ? `${fortuneData.date} | ${selectedZodiac?.name}\n${selectedCard.general}`
        : '12지신이 알려주는 소름 돋는 오늘의 운세와 나만의 행운 아이템을 확인해보세요!';

      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl: 'https://moa-tips.com/images/fortune-thumbnail.png',
          link: {
            mobileWebUrl: 'https://moa-tips.com',
            webUrl: 'https://moa-tips.com',
          },
        },
        buttons: [
          {
            title: '내 운세 확인하러 가기',
            link: {
              mobileWebUrl: 'https://moa-tips.com/fortune',
              webUrl: 'https://moa-tips.com/fortune',
            },
          },
        ],
      });
    } else {
      alert("카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 min-h-[70vh]">
      <BackButton />
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">🔮 오늘의 띠별 운세</h1>
        <p className="text-slate-500 font-medium">당신의 띠를 선택하고 오늘의 행운의 아이템을 확인하세요!</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-8">
          <p className="text-slate-500 animate-pulse font-bold">운세 데이터를 불러오는 중입니다...</p>
        </div>
      ) : (
        <>
          {/* 12 Zodiac Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto mb-12">
            {ZODIAC_SIGNS.map((zodiac) => {
              const isSelected = selectedZodiac?.name === zodiac.name;
              return (
                <button
                  key={zodiac.name}
                  onClick={() => handleZodiacClick(zodiac)}
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl transition-all duration-300 ${
                    isSelected 
                      ? `bg-gradient-to-br ${zodiac.color} text-white shadow-xl scale-105 ring-4 ring-indigo-200 border-none` 
                      : 'bg-white text-slate-700 shadow-sm border-2 border-slate-100 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-100'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl mb-2 drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{zodiac.icon}</span>
                  <span className={`text-sm sm:text-base font-extrabold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{zodiac.name}</span>
                </button>
              );
            })}
          </div>

          {/* Result Section */}
          {selectedZodiac && (
            <div ref={resultRef} className="transition-all duration-700 mt-8 max-w-2xl mx-auto transform opacity-100 translate-y-0">
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className={`bg-gradient-to-br ${ZODIAC_SIGNS.find(z => z.name === selectedZodiac.name)?.color || 'from-indigo-500 to-purple-600'} px-8 py-8 text-center shadow-inner`}>
                  <div className="text-6xl mb-3 drop-shadow-md">{selectedZodiac.icon}</div>
                  <h2 className="text-2xl font-black text-white drop-shadow-sm">{selectedZodiac.name} 오늘의 운세</h2>
                  <div className="mt-3 inline-block px-4 py-1.5 bg-white/20 rounded-full text-white text-xs font-bold tracking-widest uppercase shadow-sm">
                    {fortuneData?.date}
                  </div>
                </div>
                
                <div className="p-8">
                  {(() => {
                    const card = getCardForZodiac(selectedZodiac.name);
                    if (!card) return <p className="text-center text-slate-500 font-medium py-10">운세 결과가 없습니다. 다시 시도해주세요.</p>;
                    
                    return (
                      <>
                        <p className="text-lg font-bold text-slate-700 leading-relaxed mb-8 break-keep text-center">
                          "{card.general}"
                        </p>

                        <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-3xl p-6 border border-slate-100 text-center shadow-sm">
                          <h3 className="text-sm font-black text-slate-400 mb-2 tracking-widest uppercase">🍀 추천 럭키 아이템</h3>
                          <p className="text-2xl font-black text-rose-500 mb-6 drop-shadow-sm">{card.lucky_item}</p>
                          <div className="space-y-3 w-full">
                            {card.coupang_urls ? (
                              card.coupang_urls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block w-full px-6 py-4 bg-rose-500 text-white font-black rounded-xl shadow-md hover:bg-rose-600 transition-colors text-sm sm:text-base hover:scale-[1.02]"
                                >
                                  추천 아이템 {idx + 1} 구경하기 🎁
                                </a>
                              ))
                            ) : (
                              card.coupang_url && (
                                <a
                                  href={card.coupang_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block w-full px-6 py-4 bg-rose-500 text-white font-black rounded-xl shadow-md hover:bg-rose-600 transition-colors text-sm sm:text-base hover:scale-[1.02]"
                                >
                                  추천 아이템 구경하기 🎁
                                </a>
                              )
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 mt-4 leading-tight">
                            이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4">
                <button
                  onClick={shareToKakao}
                  className="w-full px-6 py-4 bg-[#FEE500] text-[#000000] font-black rounded-xl hover:bg-[#F4DC00] transition-colors shadow-sm flex items-center justify-center gap-3 text-base sm:text-lg"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 3c-5.52 0-10 3.52-10 7.86 0 2.8 1.83 5.25 4.65 6.64-.17.65-.63 2.45-.66 2.6-.04.18.06.18.15.12.07-.05 2.1-1.38 2.94-1.95 1.1.2 2.25.32 3.44.32 5.52 0 10-3.52 10-7.86S17.52 3 12 3z" />
                  </svg>
                  카카오톡으로 결과 공유하기
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
