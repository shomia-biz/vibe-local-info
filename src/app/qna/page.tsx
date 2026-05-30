'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function QnaPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 관리자 이메일 주소
  const ADMIN_EMAIL = 'omnia.ahn.biz@gmail.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // mailto 링크 생성
    const subject = encodeURIComponent(`[모아팁스 문의] ${title}`);
    const body = encodeURIComponent(content);
    const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;

    // 이메일 클라이언트 열기
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-800 flex items-center gap-2">
            <span className="text-2xl">✨</span> 수도권 모아팁스
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800">
            홈으로 가기
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">1:1 메일 문의 📝</h1>
          <p className="text-slate-500 font-medium">관리자에게 다이렉트로 궁금한 점을 남겨보세요. 회원님의 메일 앱을 통해 안전하게 전송됩니다.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">문의 제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                placeholder="예: 청년 지원금 신청 기간이 언제인가요?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">문의 내용</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none resize-none transition-shadow"
                placeholder="궁금한 사항을 상세히 적어주세요."
                required
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-cyan-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>🚀</span> 관리자 이메일로 전송하기
              </button>
              <p className="text-center text-slate-400 text-xs mt-3">버튼을 누르면 사용 중인 이메일 앱(Outlook, 메일 앱 등)이 열립니다.</p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
