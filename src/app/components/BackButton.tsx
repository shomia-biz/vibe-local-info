"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="inline-flex items-center text-orange-600 hover:text-orange-800 font-bold mb-8 transition-colors p-2 -ml-2 rounded-lg hover:bg-orange-50"
    >
      <span className="mr-2 text-xl">←</span> 
      <span>목록으로 돌아가기</span>
    </button>
  );
}
