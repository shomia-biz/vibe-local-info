import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import ChatBot from "@/components/ChatBot";
import WeatherWidget from "@/components/WeatherWidget";

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "송파구 생활 정보 | 행사·혜택·지원금 안내",
  description: "송파구 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  openGraph: {
    title: "송파구 생활 정보 | 행사·혜택·지원금 안내",
    description: "송파구 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    url: "https://vibe-local-info.pages.dev",
    siteName: "송파구 생활 정보",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {ADSENSE_ID && ADSENSE_ID !== "나중에_입력" && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#FFFBF7]">
        {/* 구조화 데이터: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "송파구 생활 정보",
              "url": "https://vibe-local-info.pages.dev",
              "description": "송파구 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
            })
          }}
        />
        {/* 상단 전역 내비게이션 바 (아이놀자 스타일 플로팅 바) */}
        <div className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
          <nav className="max-w-5xl mx-auto bg-[#0a0a0a] rounded-[16px] shadow-2xl border border-white/5 pointer-events-auto overflow-hidden">
            <div className="flex items-center justify-between h-[60px] px-4 sm:px-7">
              <Link href="/" className="font-[800] text-[20px] sm:text-[22px] text-white hover:opacity-90 transition-opacity shrink-0 tracking-tight">
                동네정보🍯
              </Link>

              {/* 날씨 위젯 - 중앙 배치 */}
              <div className="hidden md:block flex-1 max-w-[160px] mx-4">
                <WeatherWidget isDark={true} />
              </div>

              <div className="flex gap-4 sm:gap-[32px] items-center">
                <Link href="/" className="text-[13px] sm:text-[14px] font-[500] text-white/80 hover:text-white hover:-translate-y-[1px] transition-all tracking-[-0.14px]">
                  홈
                </Link>
                <Link href="/blog" className="text-[13px] sm:text-[14px] font-[500] text-white/80 hover:text-white hover:-translate-y-[1px] transition-all tracking-[-0.14px]">
                  AI 블로그
                </Link>
                <Link href="/about" className="text-[13px] sm:text-[14px] font-[500] text-white/80 hover:text-white hover:-translate-y-[1px] transition-all tracking-[-0.14px]">
                  소개
                </Link>
              </div>
            </div>
          </nav>
        </div>
        
        {/* 상단 여백 확보 (내비게이션 바가 떠 있으므로 상단 패딩 추가) */}
        <div className="pt-24"></div>
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* 채널톡 스타일 챗봇 */}
        <ChatBot />
      </body>
    </html>
  );
}
