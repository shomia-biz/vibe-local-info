const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const cheerio = require('cheerio');
const googleTrends = require('google-trends-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const HISTORY_FILE = path.join(__dirname, '../public/data/generated-history.json');
const KEYWORDS_FILE = path.join(__dirname, '../public/data/trending-keywords.json');

// 정치/사회 논란 관련 키워드 필터링
const politicalKeywords = [
  "여야", "국민의힘", "더불어민주당", "민주당", "윤석열", "이재명", "한동훈", 
  "국회", "대통령", "정치", "총선", "대선", "여당", "야당", "의원", 
  "공천", "특검", "탄핵", "검찰", "김건희", "정부", "장관"
];

function isPolitical(text) {
  return politicalKeywords.some(kw => text.includes(kw));
}

// 구글 트렌드 API를 통한 트렌드 확인 (간이 검증)
async function checkTrend(keyword) {
  try {
    const res = await googleTrends.interestOverTime({keyword: keyword, startTime: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000))});
    const parsed = JSON.parse(res);
    const data = parsed.default.timelineData;
    if (data && data.length > 0) {
      // 검색량이 0보다 큰지 확인
      return data.some(d => d.value[0] > 0);
    }
    return true; // 데이터가 애매하면 일단 통과
  } catch(e) {
    // 429 에러 등 API 호출 실패 시에는 기본적으로 허용
    return true; 
  }
}

// cheerio를 사용한 원문 페이지 간이 크롤링 (본문 내용 파악)
async function fetchArticleContent(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // 본문으로 추정되는 p 태그들 추출
    let text = "";
    $('p').each((i, el) => {
      if (i < 5) text += $(el).text() + " ";
    });
    return text.trim();
  } catch(e) {
    return ""; // 접근 실패 시 빈 문자열
  }
}

const RSS_SOURCES = [
  {
    category: "실시간 핫이슈",
    url: "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
    limit: 5
  },
  {
    category: "생활 꿀팁 및 지원금",
    url: "https://news.google.com/rss/search?q=" + encodeURIComponent("생활꿀팁 OR 살림꿀팁 OR 여름꿀팁 OR 소상공인 OR 가전 OR 가입조건 OR 할인혜택") + "&hl=ko&gl=KR&ceid=KR:ko",
    limit: 4
  },
  {
    category: "부동산 및 주거 정책",
    url: "https://news.google.com/rss/search?q=" + encodeURIComponent("부동산 정책 OR 신혼부부 청약 OR 주거지원") + "&hl=ko&gl=KR&ceid=KR:ko",
    limit: 3
  },
  {
    category: "세금 감면 및 절세",
    url: "https://news.google.com/rss/search?q=" + encodeURIComponent("세금 감면 OR 절세 OR 연말정산 OR 환급금 OR 숨은돈") + "&hl=ko&gl=KR&ceid=KR:ko",
    limit: 3
  },
  {
    category: "문화/여가 및 OTT",
    url: "https://news.google.com/rss/search?q=" + encodeURIComponent("넷플릭스 추천 OR OTT 신작 OR 영화 순위 OR 전시회 추천 OR 팝업스토어 OR 콘서트 OR 맛집 OR 여행") + "&hl=ko&gl=KR&ceid=KR:ko",
    limit: 3
  }
];

// Gemini AI를 활용한 기사 요약 함수
async function summarizeWithGemini(title, content) {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `다음 기사의 제목과 내용을 바탕으로 블로그 독자들에게 유용한 핵심 정보를 3~4줄로 요약해줘. \n제목: ${title}\n내용: ${content}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("⚠️ Gemini API Error:", error.message);
    return null;
  }
}

// 향후 확장을 위한 네이버 API / 유튜브 API 연동 템플릿
async function fetchAdditionalSources(keyword) {
  // TODO: 네이버 검색 API 및 유튜브 Data API 연동
  // const naverClientId = process.env.NAVER_CLIENT_ID;
  // ...
  return [];
}

async function fetchKeywordsFromSource(source, history) {
  try {
    const feed = await parser.parseURL(source.url);
    const keywords = [];
    
    for (const item of feed.items) {
      if (keywords.length >= source.limit) break;
      
      if (item.isoDate || item.pubDate) {
        const itemDate = new Date(item.isoDate || item.pubDate);
        const now = new Date();
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 2) continue;
      }

      let title = item.title;
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        parts.pop(); 
        title = parts.join(' - ').trim();
      } else {
        title = title.trim();
      }

      // 정치 뉴스 필터링 (제목 및 기본 요약 기준)
      const basicSummary = item.contentSnippet || item.content || "";
      if (isPolitical(title) || isPolitical(basicSummary)) {
        continue;
      }

      // 히스토리 중복 체크 (문자열 호환성)
      const isDuplicate = history.some(past => {
        const pastTitle = typeof past === 'string' ? past : past.title;
        return pastTitle.includes(title) || title.includes(pastTitle) || 
               calculateSimilarity(pastTitle, title) > 0.7;
      });

      if (!isDuplicate && !keywords.some(k => k.includes(title))) {
        
        // 1. Cheerio 크롤링: 본문을 가져와서 정치 성향이 있는지 2차 검증
        const articleText = await fetchArticleContent(item.link);
        if (articleText.length > 50 && isPolitical(articleText)) {
          // 본문에 정치 내용이 많으면 제외
          continue;
        }

        // 2. Google Trends: 카테고리나 제목의 주요 단어로 트렌드 유효성 확인
        // 제목의 가장 긴 단어를 키워드로 간주하여 트렌드 API 체크
        const words = title.split(' ').sort((a, b) => b.length - a.length);
        const mainKeyword = words[0].replace(/[^가-힣a-zA-Z0-9]/g, '');
        if (mainKeyword.length >= 2) {
          const isTrending = await checkTrend(mainKeyword);
          if (!isTrending) {
             // 검색 트렌드가 아예 죽어있는 키워드는 패스 (옵션)
          }
        }

        // 3. (Gemini 요약은 에러 방지를 위해 이번에는 제외하거나 필요시 사용)
        // 사용자가 이전 형식으로 요청했으므로 단순 문자열 형태로 저장
        
        keywords.push(title);
        history.push(title); 
      }
    }
    return keywords;
  } catch (err) {
    console.error(`⚠️ [${source.category}] RSS 파싱 실패:`, err.message);
    return [];
  }
}


// 간단한 자카드 유사도 비교 함수 (너무 비슷한 문장 필터링)
function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

async function runKeywordCollector() {
  console.log("========================================================");
  console.log("🔍 모아팁스 일일 핫이슈/꿀팁 키워드 수집기 시작");
  console.log("========================================================\n");

  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }

  const today = new Date().toISOString().split('T')[0];
  let todayKeywords = [];

  for (const source of RSS_SOURCES) {
    console.log(`📡 [${source.category}] 데이터 수집 및 트렌드 분석 중...`);
    const keywords = await fetchKeywordsFromSource(source, history);
    console.log(`  -> ${keywords.length}개 유효 핫이슈 발견 (정치뉴스 필터링됨)`);
    
    // 이전 방식대로 카테고리를 앞에 붙인 문자열 포맷으로 되돌림
    const taggedKeywords = keywords.map(kw => `[${source.category}] ${kw}`);
    todayKeywords = todayKeywords.concat(taggedKeywords);
  }

  if (todayKeywords.length === 0) {
    console.log("\n⚠️ 오늘 새로 수집된 신규 핫이슈가 없습니다.");
    return;
  }

  console.log(`\n✅ 총 ${todayKeywords.length}개의 신선한 핫이슈 정보가 수집되었습니다!`);

  // 히스토리 파일 업데이트
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');

  // public/data/trending-keywords.json 업데이트
  let keywordsData = {};
  if (fs.existsSync(KEYWORDS_FILE)) {
    try {
      keywordsData = JSON.parse(fs.readFileSync(KEYWORDS_FILE, 'utf8'));
    } catch(e) {}
  }
  
  if (!keywordsData[today]) {
    keywordsData[today] = [];
  }
  
  // 중복 없이 추가
  todayKeywords.forEach(kw => {
    if (!keywordsData[today].includes(kw)) {
      keywordsData[today].push(kw);
    }
  });

  fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(keywordsData, null, 2), 'utf8');

  console.log(`\n🎉 성공! 수집된 데이터가 public/data/trending-keywords.json 에 저장되었습니다.`);
  console.log("수동으로 글을 생성할 때 이 JSON 파일을 참고하세요.");
  console.log("\n========================================================");
}

runKeywordCollector();
