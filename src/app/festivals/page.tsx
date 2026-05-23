import React from 'react';

// TourAPI 데이터 타입 정의
interface FestivalItem {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  eventstartdate: string;
  eventenddate: string;
  tel: string;
}

// 오늘 날짜를 YYYYMMDD 형식으로 가져오는 함수
const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

async function getSeoulFestivals() {
  const RAW_KEY = process.env.PUBLIC_DATA_API_KEY;
  
  if (!RAW_KEY || RAW_KEY === '발급받은_인증키_입력') {
    console.error('❌ PUBLIC_DATA_API_KEY가 설정되지 않았습니다.');
    return [];
  }

  // 공공데이터 포털 키는 인코딩 문제로 인해 decode 후 다시 사용하는 것이 안전할 때가 많습니다.
  const API_KEY = decodeURIComponent(RAW_KEY);
  const PUBLIC_DATA_API_KEY = encodeURIComponent(API_KEY); // 변수명 오류 방지용
  const today = getTodayString();
  
  // 한국관광공사 TourAPI (행사정보 조회)
  const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=${PUBLIC_DATA_API_KEY}&_type=json&MobileOS=ETC&MobileApp=MoaTips&areaCode=1&eventStartDate=${today}&numOfRows=20`;

  console.log('📡 TourAPI 호출 중 (안전 모드)...');

  try {
    const res = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ TourAPI 응답 오류 (${res.status}):`, errorText);
      throw new Error(`API 응답 오류: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.response?.header?.resultCode !== '0000') {
      console.error('❌ TourAPI 결과 코드 오류:', data.response?.header?.resultMsg);
      return [];
    }

    return data.response.body.items.item || [];
  } catch (error) {
    console.error('⚠️ TourAPI 연결 실패:', error);
    return [];
  }
}

export default async function FestivalsPage() {
  const festivals: FestivalItem[] = await getSeoulFestivals();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            서울시 실시간 축제 정보 🎊
          </h1>
          <p className="text-lg text-slate-600">
            한국관광공사 데이터를 바탕으로 현재 진행 중인 서울의 축제를 소개합니다.
          </p>
        </header>

        {festivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {festivals.map((item) => (
              <div 
                key={item.contentid} 
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col"
              >
                {/* 카드 이미지 */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={item.firstimage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      서울 축제
                    </span>
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    📍 {item.addr1}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-400">
                      📅 {item.eventstartdate} ~ {item.eventenddate}
                    </div>
                    <button className="text-indigo-600 font-bold text-sm hover:underline">
                      자세히 보기 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">현재 진행 중인 축제 정보가 없습니다. 😅</p>
          </div>
        )}
      </div>
    </div>
  );
}
