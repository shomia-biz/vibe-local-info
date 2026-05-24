import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오늘의 운세 | 수도권 모아팁스',
  description: '매일 매일 업데이트되는 오늘의 운세를 확인해보세요.',
};

export default function FortunePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">🔮 오늘의 운세</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-600 text-lg">운세 기능이 곧 추가될 예정입니다!</p>
      </div>
    </main>
  );
}
