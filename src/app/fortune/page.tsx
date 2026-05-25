"use client";

import React, { useEffect, useState } from 'react';

interface FortuneCardData {
  type: string;
  general: string;
  lucky_item: string;
  coupang_url: string;
}

interface FortuneData {
  date: string;
  cards?: FortuneCardData[];
}

export default function FortunePage() {
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const handleCardClick = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 min-h-[70vh]">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">🔮 오늘의 운세</h1>
      
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-8">
          <p className="text-slate-500 animate-pulse font-bold">운세 카드를 섞는 중입니다...</p>
        </div>
      ) : fortuneData && fortuneData.cards && fortuneData.cards.length === 3 ? (
        <>
          <p className="text-slate-500 text-center mb-10 font-medium">
            {selectedIndex === null 
              ? "오늘 당신의 직감이 이끄는 카드를 한 장 선택하세요!" 
              : "당신의 선택 결과입니다."}
          </p>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${selectedIndex !== null ? 'max-w-md mx-auto md:grid-cols-1' : ''}`}>
            {fortuneData.cards.map((card, index) => {
              const isSelected = selectedIndex === index;
              const isHidden = selectedIndex !== null && !isSelected;
              
              if (isHidden) return null;

              return (
                <div 
                  key={index} 
                  className="perspective-[1000px]"
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className={`relative w-full cursor-pointer transition-all duration-700 ${selectedIndex === null ? 'hover:-translate-y-3 hover:shadow-xl' : ''}`}
                    onClick={() => handleCardClick(index)}
                    style={{ 
                      transformStyle: 'preserve-3d', 
                      transform: isSelected ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      minHeight: isSelected ? '520px' : '400px'
                    }}
                  >
                    {/* Front of the Card (Hidden if selected) */}
                    <div 
                      className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl border-4 border-indigo-300/50 p-8 text-center flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-6xl mb-6 opacity-90">✨</div>
                      <h2 className="text-xl font-black text-white mb-2 tracking-wide drop-shadow-md">
                        미스터리 카드
                      </h2>
                      <p className="text-indigo-100 mt-4 text-sm font-bold bg-white/20 px-5 py-2 rounded-full shadow-inner">
                        클릭해서 뽑기 👆
                      </p>
                    </div>

                    {/* Back of the Card (Visible if selected) */}
                    <div 
                      className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 p-8 text-center flex flex-col justify-between"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div>
                        <div className="mb-4 inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black tracking-wide">
                          {fortuneData.date} | {card.type}
                        </div>
                        <p className="text-lg font-bold text-slate-800 leading-relaxed mb-6 break-keep">
                          "{card.general}"
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/60 mt-auto">
                        <h3 className="text-xs font-black text-slate-400 mb-2 tracking-widest">🍀 오늘의 럭키 아이템</h3>
                        <p className="text-xl font-black text-rose-500 mb-6">{card.lucky_item}</p>
                        <a 
                          href={card.coupang_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block w-full px-6 py-3.5 bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          구경하기 🎁
                        </a>
                        <p className="text-[10px] font-medium text-slate-400 mt-4 leading-tight">
                          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedIndex !== null && (
            <div className="mt-8 text-center animate-fade-in">
              <button 
                onClick={() => setSelectedIndex(null)}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-colors shadow-sm"
              >
                다른 카드 다시 뽑기 🔄
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-8">
          <p className="text-slate-600 font-medium">아직 오늘의 운세가 준비되지 않았습니다. (데이터 업데이트 중)</p>
        </div>
      )}
    </main>
  );
}
