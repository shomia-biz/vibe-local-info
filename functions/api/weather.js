export async function onRequestGet(context) {
  try {
    const scrapeNaverWeather = async (query) => {
      try {
        const res = await fetch(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
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
        return { query, temp: null, condition: '오류' };
      }
    };

    const results = await Promise.all([
      scrapeNaverWeather('서울 날씨'),
      scrapeNaverWeather('수원 날씨'),
      scrapeNaverWeather('인천 날씨')
    ]);

    return new Response(JSON.stringify({
      success: true,
      data: results
    }), {
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Weather fetch failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
