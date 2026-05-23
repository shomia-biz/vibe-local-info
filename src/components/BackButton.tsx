'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-8 flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors group"
    >
      <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
      이전 페이지로 돌아가기
    </button>
  );
}
