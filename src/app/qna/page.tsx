'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  author: string;
  content?: string; // 목록에선 안 보일 수 있음
  isPrivate: boolean;
  createdAt: string;
  status: string;
  adminReply?: string;
}

export default function QnaPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 작성 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // 읽기 상태
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [unlockedContent, setUnlockedContent] = useState<{ [key: string]: Question }>({});
  const [unlockError, setUnlockError] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/qna');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.error('Failed to fetch qna', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newContent || (isPrivate && !newPassword)) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const payload = {
      title: newTitle,
      author: newAuthor,
      content: newContent,
      isPrivate,
      password: newPassword
    };

    try {
      const res = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('문의가 등록되었습니다. 관리자가 확인 후 답변을 남겨드립니다.');
        setShowForm(false);
        setNewTitle('');
        setNewAuthor('');
        setNewContent('');
        setIsPrivate(false);
        setNewPassword('');
        fetchQuestions();
      } else {
        alert('등록에 실패했습니다.');
      }
    } catch (e) {
      alert('오류가 발생했습니다.');
    }
  };

  const handleExpand = async (q: Question) => {
    if (expandedId === q.id) {
      setExpandedId(null);
      return;
    }

    setUnlockError('');
    setPasswordInput('');

    if (q.isPrivate && !unlockedContent[q.id]) {
      // 비밀번호 필요
      setExpandedId(q.id);
    } else {
      // 공개글이거나 이미 열린 글
      setExpandedId(q.id);
      if (!unlockedContent[q.id] && !q.isPrivate) {
        // 이미 내용이 q 객체에 있으므로 그냥 열면 됨 (API가 공개글의 내용은 다 줬다고 가정. 하지만 현재 GET은 content를 주긴 함)
        // 만약 안 줬다면 여기서 fetch 해야함. 지금은 GET에서 password만 빼고 다 주므로 그냥 표시 가능
      }
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      const res = await fetch('/api/qna/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUnlockedContent(prev => ({ ...prev, [id]: data.question }));
        setUnlockError('');
      } else {
        setUnlockError('비밀번호가 일치하지 않습니다.');
      }
    } catch (e) {
      setUnlockError('오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 헤더 영역 */}
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">1:1 문의 게시판 📝</h1>
            <p className="text-slate-500 font-medium">AI가 해결해주지 못한 궁금증이나 불편사항을 남겨주세요.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
          >
            {showForm ? '취소하기' : '글쓰기'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-800 mb-4">새 문의글 작성</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">제목</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="문의 제목을 입력하세요" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">작성자명</label>
                  <input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="이름 또는 닉네임" required />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">내용</label>
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="궁금한 사항을 상세히 적어주세요." required></textarea>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500" />
                  <span className="font-bold text-slate-700">🔒 비밀글로 작성하기</span>
                </label>
                {isPrivate && (
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} maxLength={4} className="w-32 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center" placeholder="비밀번호(4자리)" required />
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-900 transition-colors">
                  등록하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 font-medium">불러오는 중...</div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="font-bold text-lg text-slate-700">아직 등록된 문의가 없습니다.</p>
              <p className="text-sm mt-1">첫 번째 문의를 남겨보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questions.map((q) => (
                <div key={q.id} className="flex flex-col">
                  {/* 목록 헤더 */}
                  <div 
                    onClick={() => handleExpand(q)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${q.status === '답변완료' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {q.status}
                        </span>
                        {q.isPrivate && <span className="text-slate-400">🔒</span>}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 truncate">{q.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span>{q.author}</span>
                        <span>•</span>
                        <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <svg className={`w-6 h-6 transform transition-transform ${expandedId === q.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* 확장된 본문 영역 */}
                  {expandedId === q.id && (
                    <div className="p-5 bg-slate-50 border-t border-slate-100">
                      {q.isPrivate && !unlockedContent[q.id] ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <span className="text-3xl mb-3 block">🔒</span>
                          <p className="text-slate-700 font-bold mb-4">비밀글입니다. 비밀번호를 입력해주세요.</p>
                          <div className="flex gap-2">
                            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} maxLength={4} className="w-32 px-4 py-2 border border-slate-300 rounded-xl text-center outline-none focus:border-orange-500" placeholder="비밀번호" />
                            <button onClick={() => handleUnlock(q.id)} className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">확인</button>
                          </div>
                          {unlockError && <p className="text-red-500 text-sm mt-2 font-medium">{unlockError}</p>}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-white p-5 rounded-xl border border-slate-200">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                              {unlockedContent[q.id]?.content || q.content}
                            </p>
                          </div>
                          
                          {/* 관리자 답변 영역 */}
                          {(unlockedContent[q.id]?.adminReply || q.adminReply) ? (
                            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 ml-4 relative">
                              <div className="absolute -left-3 top-5 text-2xl">↪</div>
                              <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                <span>👨‍💼</span> 관리자 답변
                              </h4>
                              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                {unlockedContent[q.id]?.adminReply || q.adminReply}
                              </p>
                            </div>
                          ) : (
                            <div className="ml-4 p-4 bg-slate-100/50 rounded-xl border border-slate-200/50 text-slate-500 text-sm font-medium flex items-center gap-2">
                              <span>⏳</span> 아직 관리자의 답변이 등록되지 않았습니다.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
