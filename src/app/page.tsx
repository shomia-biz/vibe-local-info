"use client";

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('./HomeContent'), { 
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center text-xl font-bold text-slate-400">앱을 불러오는 중입니다...</div>
});

export default function Home() {
  return <HomeContent />;
}
