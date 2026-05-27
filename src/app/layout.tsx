import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import ChatBot from "@/components/ChatBot";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "수도권 모아팁스 | 지원금·행사·혜택 안내",
  description: "서울, 경기, 인천 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  openGraph: {
    title: "수도권 모아팁스 | 지원금·행사·혜택 안내",
    description: "서울, 경기, 인천 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    url: "https://moa-tips.com",
    siteName: "수도권 모아팁스",
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
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7299812089029185"
          crossOrigin="anonymous"
        ></script>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DZ5L26LSW0"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DZ5L26LSW0');
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC]" suppressHydrationWarning>
        {/* 구조화 데이터: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "수도권 모아팁스",
              "url": "https://moa-tips.com",
              "description": "수도권 주민을 위한 지역 행사, 축제, 지원금, 혜택 정보"
            })
          }}
        />
        <Script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js" strategy="lazyOnload" />
        {/* 상단 전역 내비게이션 바 (화이트 스티키 바) */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <nav className="max-w-6xl mx-auto h-[64px] px-4 sm:px-6 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-xl sm:text-2xl text-slate-900 hover:opacity-80 transition-opacity tracking-tight flex items-center gap-1">
              모아팁스🍯
            </Link>

            <div className="flex gap-6 sm:gap-10 items-center">
              <Link href="/" className="text-sm sm:text-[15px] font-semibold text-slate-600 hover:text-cyan-600 transition-colors">
                홈
              </Link>
              <Link href="/blog" className="text-sm sm:text-[15px] font-semibold text-slate-600 hover:text-cyan-600 transition-colors">
                AI 블로그
              </Link>
              <Link href="/about" className="text-sm sm:text-[15px] font-semibold text-slate-600 hover:text-cyan-600 transition-colors">
                소개
              </Link>
              <Link href="/fortune" className="text-sm sm:text-[15px] font-semibold text-slate-600 hover:text-cyan-600 transition-colors">
                🔮 오늘의 운세
              </Link>
            </div>
          </nav>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 pt-[64px]">
          {children}
        </div>

        {/* 채널톡 스타일 챗봇 */}
        <ChatBot />
      </body>
    </html>
  );
}
