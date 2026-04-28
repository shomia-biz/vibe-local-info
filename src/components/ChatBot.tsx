'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatDataItem {
  question: string;
  answer: string;
}

interface Message {
  type: 'user' | 'bot';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: '안녕하세요! 궁금하신 점이 있으신가요? 아래 질문 버튼을 누르거나 직접 질문을 입력해 주세요.' }
  ]);
  const [chatData, setChatData] = useState<ChatDataItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // chat-data.json 불러오기
  useEffect(() => {
    fetch('/chat-data.json')
      .then((res) => res.json())
      .then((data) => setChatData(data))
      .catch((err) => console.error('Failed to load chat data:', err));
  }, []);

  // 메시지 추가될 때마다 스크롤 아래로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleQuestionClick = (item: ChatDataItem) => {
    const newMessages: Message[] = [...messages, { type: 'user', text: item.question }];
    setMessages(newMessages);

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text: item.answer }]);
    }, 500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }]
        }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [...prev, { type: 'bot', text: data.response }]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { type: 'bot', text: '죄송합니다. 오류가 발생했습니다: ' + data.error }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { type: 'bot', text: '네트워크 오류가 발생했습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* 챗봇 창 */}
      <div
        className={`fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'
        } flex flex-col max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none`}
      >
        {/* 헤더 */}
        <div className="bg-orange-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">AI 상담원</h3>
              <p className="text-xs text-orange-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                온라인
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors max-sm:block hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 대화 영역 */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto bg-[#F3F4F6] space-y-4 scroll-smooth"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user'
                    ? 'bg-orange-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 질문 버튼 및 입력 영역 */}
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide mb-3 pb-1">
            {chatData.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(item)}
                className="inline-block px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100 hover:bg-orange-100 transition-colors shrink-0"
              >
                {item.question}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="궁금한 내용을 입력하세요..."
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:bg-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 group"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
