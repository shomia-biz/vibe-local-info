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

      // 선택된 카드가 있으면 해당 운세를, 없으면 기본 문구를 보여줍니다.
      const selectedCard = selectedIndex !== null && fortuneData && fortuneData.cards ? fortuneData.cards[selectedIndex] : null;
      
      const shareTitle = selectedCard && fortuneData
        ? `[${fortuneData.date} | ${selectedCard.type}]\n🔮 오늘의 운세 결과` 
        : '🔮 나의 오늘의 운세 결과는?';
        
      const shareDescription = selectedCard 
        ? `"${selectedCard.general}"\n\n🍀 행운의 아이템: ${selectedCard.lucky_item}` 
        : '신비로운 타로 카드가 알려주는 소름 돋는 오늘의 운세와 나만의 행운 아이템을 확인해보세요!';

      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl: 'https://moa-tips.com/images/fortune-thumbnail.png',
          imageWidth: 800,
          imageHeight: 400, // 2:1 비율로 설정하여 이미지가 카톡 화면에서 덜 부담스럽게(작게) 보이도록 유도합니다.
          link: {
            mobileWebUrl: 'https://moa-tips.com', // 그림이나 모아팁스를 눌렀을 때는 홈페이지 메인으로!
            webUrl: 'https://moa-tips.com',
          },
        },
        buttons: [
          {
            title: '나도 타로 뽑아보기',
            link: {
              mobileWebUrl: 'https://moa-tips.com/fortune', // 버튼을 눌렀을 때는 운세 페이지로!
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
          <div className={`grid grid-cols-1 gap-6 transition-all duration-700 ${selectedIndex !== null ? 'max-w-md mx-auto md:grid-cols-1' : 'md:grid-cols-3'}`}>
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
            <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in">
              <button
                onClick={shareToKakao}
                className="w-full max-w-md px-6 py-3 bg-[#FEE500] text-[#000000] font-black rounded-xl hover:bg-[#F4DC00] transition-colors shadow-md flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 3c-5.52 0-10 3.52-10 7.86 0 2.8 1.83 5.25 4.65 6.64-.17.65-.63 2.45-.66 2.6-.04.18.06.18.15.12.07-.05 2.1-1.38 2.94-1.95 1.1.2 2.25.32 3.44.32 5.52 0 10-3.52 10-7.86S17.52 3 12 3z" />
                </svg>
                카카오톡으로 소름 돋는 내 운세 공유하기
              </button>

              <button
                onClick={() => setSelectedIndex(null)}
                className="px-6 py-2 bg-transparent text-slate-400 font-bold rounded-full hover:text-slate-600 transition-colors text-sm"
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
