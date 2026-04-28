import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

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
        {/* 상단 전역 내비게이션 바 */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="font-bold text-xl text-orange-600 hover:text-orange-700 transition-colors">
                동네정보🍯
              </Link>
              <div className="flex gap-6">
                <Link href="/" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
                  홈
                </Link>
                <Link href="/blog" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
                  AI 블로그
                </Link>
                <Link href="/about" className="font-medium text-gray-600 hover:text-orange-600 transition-colors">
                  소개
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
