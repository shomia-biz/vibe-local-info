import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 항상 최신 데이터 가져오기

const scrapeNaverWeather = async (query: string) => {
  try {
    const res = await fetch(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store' // 캐시 비활성화 (항상 실시간)
    });
    
    const html = await res.text();
    
    const tempMatch = html.match(/<div class="temperature_text">[\s\S]*?<span class="blind">현재 온도<\/span>([^<]+)/);
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
