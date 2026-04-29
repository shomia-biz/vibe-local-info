import localData from "../../../../../public/data/local-info.json";
import { notFound } from "next/navigation";
import BackButton from "../../../components/BackButton";

// 정적 배포(output: export)를 위해 미리 만들어둘 모든 페이지 주소를 Next.js에게 알려주는 함수입니다.
export function generateStaticParams() {
  const eventParams = localData.events.map((event) => ({
    type: "events",
    id: event.id.toString(),
  }));

  const benefitParams = localData.benefits.map((benefit) => ({
    type: "benefits",
    id: benefit.id.toString(),
  }));

  const nationalEventParams = (localData.nationalEvents || []).map((event) => ({
    type: "nationalEvents",
    id: event.id.toString(),
  }));

  const seoulEventParams = (localData.seoulEvents || []).map((event) => ({
    type: "seoulEvents",
    id: event.id.toString(),
  }));

  return [...eventParams, ...benefitParams, ...nationalEventParams, ...seoulEventParams];
}

// 상세 페이지 화면 그리기
export default async function DetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  // Next.js 최신 버전에서는 params를 가져올 때 await를 사용해야 합니다.
  const { type, id } = await params;

  // URL에 따라 행사인지 혜택인지 확인하고 데이터를 가져옵니다.
  let itemData;
  if (type === "events") {
    itemData = localData.events.find((e) => e.id.toString() === id);
  } else if (type === "benefits") {
    itemData = localData.benefits.find((b) => b.id.toString() === id);
  } else if (type === "nationalEvents") {
    itemData = localData.nationalEvents?.find((e) => e.id.toString() === id);
  } else if (type === "seoulEvents") {
    itemData = localData.seoulEvents?.find((e) => e.id.toString() === id);
  }

  // 만약 주소가 잘못되어서 데이터가 없다면 "페이지를 찾을 수 없습니다(404)"를 보여줍니다.
  if (!itemData) {
    notFound();
  }

  // 화면 디자인을 위해 지금 보고 있는 게 행사인지 판별합니다.
  const isEvent = type === "events" || type === "nationalEvents" || type === "seoulEvents";

  return (
    <main className="min-h-screen bg-[#FFFBF7] font-sans pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 목록으로 돌아가기 버튼 */}
        <BackButton />

        {/* 상세 정보 흰색 카드 배경 */}
        <article className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 sm:p-10 relative overflow-hidden">
          
          {/* 장식용 디자인 요소 */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-bl-full opacity-60 pointer-events-none"></div>

          <div className="mb-6 relative z-10">
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${type === 'seoulEvents' ? 'bg-blue-100 text-blue-800' : type === 'nationalEvents' ? 'bg-pink-100 text-pink-800' : isEvent ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-900'}`}>
              {itemData.category}
            </span>
          </div>

          <h1 className="text-[26px] sm:text-[28px] lg:text-[28px] font-extrabold text-gray-900 mb-8 leading-tight relative z-10 break-keep">
            {itemData.name}
          </h1>

          {/* 핵심 정보 요약 박스 (회색 배경) */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-10 space-y-5 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6">
              <span className="text-gray-500 font-semibold min-w-[60px] text-lg sm:text-xl">기간</span>
              <span className="text-gray-900 font-bold text-lg sm:text-xl">
                {itemData.startDate === '상시' ? '상시 진행' : `${itemData.startDate} ~ ${itemData.endDate}`}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6">
              <span className="text-gray-500 font-semibold min-w-[60px] text-lg sm:text-xl">장소</span>
              <span className="text-gray-900 font-bold text-lg sm:text-xl">{itemData.location}</span>
            </div>
            {itemData.target && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6">
                <span className="text-gray-500 font-semibold min-w-[60px] text-lg sm:text-xl">대상</span>
                <span className="text-gray-900 font-bold text-lg sm:text-xl">{itemData.target}</span>
              </div>
            )}
          </div>

          {/* 상세 설명 (전문) */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span>📝</span> 상세 안내
            </h2>
            <div className="text-gray-700 leading-relaxed text-lg sm:text-xl break-keep">
              {itemData.summary}
              
              <div className="mt-8 p-6 sm:p-8 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h3 className="font-bold text-orange-800 text-lg">AI가 요약한 친절한 안내</h3>
                </div>
                <div className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                  {itemData.blogContent}
                </div>
              </div>
            </div>
          </div>

          {/* 원본 사이트 이동 버튼 */}
          <a 
            href={itemData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-orange-600 text-white font-bold text-lg py-5 rounded-2xl hover:bg-orange-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            원본 사이트에서 자세히 보기 →
          </a>

        </article>
      </div>
    </main>
  );
}
