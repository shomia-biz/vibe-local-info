import localData from "../../public/data/local-info.json";
import Link from "next/link";

export default function Home() {
  // 오늘 날짜를 가져와서 "202x년 x월 x일" 형식으로 만들어줍니다.
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-[#FFFBF7] font-sans pb-10"> {/* 따뜻한 크림색 배경 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. 상단 헤더 */}
        <header className="text-center pt-16 pb-10 border-b-2 border-orange-100/50">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-600 mb-4 tracking-tight drop-shadow-sm">
            서울 송파구 생활 정보 🏡
          </h1>
          <p className="text-lg sm:text-xl text-orange-800/80 font-medium">
            우리 동네의 따뜻한 소식과 알찬 혜택을 한눈에 모아보세요
          </p>
        </header>
        
        {/* 2. 이번 달 행사/축제 카드 목록 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🎈</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">이번 달 행사/축제</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {localData.events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-3xl shadow-sm border border-orange-50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                  {event.summary}
                </p>
                
                {/* 상세 정보 박스 */}
                <div className="space-y-2 text-sm text-gray-700 bg-orange-50/50 p-4 rounded-2xl">
                  <p className="flex items-start gap-2">
                    <span className="text-orange-400">📅</span> 
                    <span>{event.startDate} ~ {event.endDate}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-orange-400">📍</span> 
                    <span>{event.location}</span>
                  </p>
                  {event.target && (
                    <p className="flex items-start gap-2">
                      <span className="text-orange-400">👤</span> 
                      <span>{event.target}</span>
                    </p>
                  )}
                </div>
                
                {/* 상세보기 버튼 - Link 컴포넌트 적용 */}
                <Link 
                  href={`/detail/events/${event.id}`} 
                  className="mt-5 block text-center bg-orange-50 text-orange-600 font-semibold py-3 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  상세보기
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 지원금/혜택 정보 카드 목록 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🎁</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">지원금/혜택 정보</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {localData.benefits.map((benefit) => (
              <div 
                key={benefit.id} 
                className="bg-white rounded-3xl shadow-sm border border-yellow-100 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col"
              >
                {/* 카드 배경에 있는 동그란 예쁜 장식 */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full opacity-50 pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                    {benefit.category}
                  </span>
                  <h3 className="font-bold text-xl sm:text-2xl text-gray-900">{benefit.name}</h3>
                </div>
                
                <p className="text-gray-700 mb-6 flex-grow leading-relaxed relative z-10">
                  {benefit.summary}
                </p>
                
                {/* 상세 정보 박스 */}
                <div className="space-y-3 text-sm sm:text-base text-gray-700 bg-gray-50/80 p-5 rounded-2xl relative z-10">
                  {benefit.target && (
                    <p className="flex items-start gap-2">
                      <span className="font-semibold min-w-[40px] text-gray-900">대상:</span> 
                      <span>{benefit.target}</span>
                    </p>
                  )}
                  <p className="flex items-start gap-2">
                    <span className="font-semibold min-w-[40px] text-gray-900">기간:</span> 
                    <span>{benefit.startDate === '상시' ? '상시 진행' : `${benefit.startDate} ~ ${benefit.endDate}`}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold min-w-[40px] text-gray-900">신청:</span> 
                    <span>{benefit.location}</span>
                  </p>
                </div>
                
                {/* 자세히 알아보기 버튼 - Link 컴포넌트 적용 */}
                <Link 
                  href={`/detail/benefits/${benefit.id}`} 
                  className="mt-6 block text-center bg-[#FFD93D] text-yellow-900 font-bold py-3.5 rounded-xl hover:bg-[#FFC900] transition-colors relative z-10 shadow-sm"
                >
                  자세히 알아보기
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 이달의 서울특별시 주요 축제 행사 TOP 9 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🌇</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">이달의 서울특별시 주요 축제 행사 TOP 9</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {localData.seoulEvents?.map((event) => (
              <div 
                key={`seoul-${event.id}`} 
                className="bg-white rounded-3xl shadow-sm border border-blue-50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                  {event.summary}
                </p>
                
                {/* 상세 정보 박스 */}
                <div className="space-y-2 text-sm text-gray-700 bg-blue-50/50 p-4 rounded-2xl">
                  <p className="flex items-start gap-2">
                    <span className="text-blue-400">📅</span> 
                    <span>{event.startDate} ~ {event.endDate}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-blue-400">📍</span> 
                    <span>{event.location}</span>
                  </p>
                </div>
                
                {/* 상세보기 버튼 */}
                <Link 
                  href={`/detail/seoulEvents/${event.id}`} 
                  className="mt-5 block text-center bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  상세보기
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 이달의 전국 주요 축제 TOP 9 */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🌸</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">이달의 전국 주요 축제 TOP 9</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {localData.nationalEvents?.map((event) => (
              <div 
                key={`national-${event.id}`} 
                className="bg-white rounded-3xl shadow-sm border border-pink-50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                  {event.summary}
                </p>
                
                {/* 상세 정보 박스 */}
                <div className="space-y-2 text-sm text-gray-700 bg-pink-50/50 p-4 rounded-2xl">
                  <p className="flex items-start gap-2">
                    <span className="text-pink-400">📅</span> 
                    <span>{event.startDate} ~ {event.endDate}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-pink-400">📍</span> 
                    <span>{event.location}</span>
                  </p>
                </div>
                
                {/* 상세보기 버튼 */}
                <Link 
                  href={`/detail/nationalEvents/${event.id}`} 
                  className="mt-5 block text-center bg-pink-50 text-pink-600 font-semibold py-3 rounded-xl hover:bg-pink-100 transition-colors"
                >
                  상세보기
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 하단 푸터 (데이터 출처 및 업데이트 날짜) */}
        <footer className="mt-20 pt-8 border-t border-gray-200/60 text-center pb-8">
          <p className="text-sm text-gray-500 mb-2">
            데이터 출처: 공공데이터포털 (data.go.kr) 및 송파구청
          </p>
          <p className="text-xs text-gray-400 font-medium">
            마지막 업데이트: {currentDate}
          </p>
        </footer>
        
      </div>
    </main>
  );
}
