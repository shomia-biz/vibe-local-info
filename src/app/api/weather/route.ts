import { NextResponse } from 'next/server';

export const revalidate = 600; // 10분(600초) 캐시 설정

const scrapeNaverWeather = async (query: string) => {
  try {
    const res = await fetch(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 600 } // Next.js fetch 캐시 (10분)
    });
    
    const html = await res.text();
    
    const tempMatch = html.match(/<div class="temperature_text">.*?<span class="blind">현재 온도<\/span>([^<]+)/s);
    const condMatch = html.match(/<span class="weather before_slash">([^<]+)<\/span>/);
    
    return {
      query,
      temp: tempMatch ? parseFloat(tempMatch[1].trim()) : null,
      condition: condMatch ? condMatch[1].trim() : '알 수 없음'
    };
  } catch (error) {
    console.error(`Failed to fetch weather for ${query}:`, error);
    return { query, temp: null, condition: '오류' };
  }
};

export async function GET() {
  try {
    // 3개 지역 동시 파싱 (서울, 경기(수원), 인천)
    const results = await Promise.all([
      scrapeNaverWeather('서울 날씨'),
      scrapeNaverWeather('수원 날씨'), // 경기도 대표
      scrapeNaverWeather('인천 날씨')
    ]);

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Weather fetch failed' }, { status: 500 });
  }
}
