import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-[#FFFBF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl mx-auto">
        <h1 className="text-8xl sm:text-9xl font-black text-indigo-500 mb-6 drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">
          페이지를 찾을 수 없습니다 😥
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-10 break-keep leading-relaxed">
          요청하신 페이지가 삭제되었거나 주소가 잘못 입력되었습니다.
          <br className="hidden sm:block" />
          홈으로 돌아가서 모아팁스의 다양한 혜택과 정보들을 다시 확인해 보세요!
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-xl hover:shadow-indigo-200 active:scale-95"
        >
          <span>🏠 메인 화면으로 돌아가기</span>
        </Link>
      </div>
    </main>
  );
}
