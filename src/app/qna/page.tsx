'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function QnaPage() {
  // 사용자가 입력한 값들을 저장하는 공간
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // 현재 상태를 저장하는 공간 (전송중인지, 전송완료인지, 에러가 났는지)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 버튼을 눌러도 새로고침 되지 않게 막아줍니다.
    
    if (!email.trim() || !title.trim() || !content.trim()) {
      alert('이메일, 제목, 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Web3Forms라는 무료 서비스를 이용해 이메일을 전송합니다.
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          // ★ 중요: 여기에 Web3Forms에서 발급받은 키를 넣으세요!
          access_key: '0f611663-b53b-4ff2-b04a-e37d02a06e17', 
          email: email,
          subject: `[모아팁스 문의] ${title}`,
          message: content,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setIsSuccess(true); // 성공하면 완료 화면으로 바뀝니다.
      } else {
        setErrorMsg('메일 전송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setErrorMsg('오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
    } finally {
      setIsSubmitting(false); // 전송이 끝나면 로딩 상태를 해제합니다.
    }
  };

  // ----------------------------------------------------
  // 1. 성공적으로 전송되었을 때 보여줄 완료 화면
  // ----------------------------------------------------
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-800 flex items-center gap-2">
              <span className="text-2xl">✨</span> 모아팁스
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">문의가 성공적으로 접수되었습니다!</h1>
          <p className="text-slate-500 font-medium mb-8">
            남겨주신 이메일({email})로<br />빠른 시일 내에 답변을 보내드리겠습니다.
          </p>
          <Link href="/" className="inline-block px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl shadow-md hover:bg-cyan-700 transition-colors">
            홈으로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. 기본 문의 작성 화면
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-tight text-slate-800 flex items-center gap-2">
            <span className="text-2xl">✨</span> 모아팁스
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800">
            홈으로 가기
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">1:1 메일 문의 📝</h1>
          <p className="text-slate-500 font-medium">관리자에게 다이렉트로 궁금한 점을 남겨보세요. 남겨주신 이메일로 답변해 드립니다.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">답변 받을 이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                placeholder="예: gildong@gmail.com"
                required
              />
            </div>
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

            {/* 에러 메시지가 있을 경우에만 빨간색으로 보여줍니다. */}
            {errorMsg && (
              <p className="text-red-500 text-sm font-bold">{errorMsg}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting} // 전송 중일 때는 버튼을 누르지 못하게 막습니다.
                className="w-full py-4 bg-cyan-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* 전송 중일 때와 아닐 때 버튼 글씨를 다르게 보여줍니다. */}
                {isSubmitting ? '전송 중입니다...' : '🚀 문의 접수하기'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
