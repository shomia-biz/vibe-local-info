const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();

const HISTORY_FILE = path.join(__dirname, 'generated-history.json');
const KEYWORDS_FILE = path.join(__dirname, '../public/data/trending-keywords.json');

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
    url: "https://news.google.com/rss/search?q=" + encodeURIComponent("넷플릭스 추천 OR OTT 신작 OR 영화 순위 OR 전시회 추천 OR 팝업스토어") + "&hl=ko&gl=KR&ceid=KR:ko",
    limit: 3
  }
];

async function fetchKeywordsFromSource(source, history) {
  try {
    const feed = await parser.parseURL(source.url);
    const keywords = [];
    
    for (const item of feed.items) {
      if (keywords.length >= source.limit) break;
      
      // 구글 뉴스 타이틀 정리 (" - 언론사" 제거)
      let title = item.title;
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        parts.pop(); // 마지막 언론사 부분 제거
        title = parts.join(' - ').trim();
      } else {
        title = title.trim();
      }

      // 중복 체크 (기존 히스토리에 있는지, 혹은 너무 비슷한지)
      const isDuplicate = history.some(past => 
        past.includes(title) || title.includes(past) || 
        calculateSimilarity(past, title) > 0.7
      );

      if (!isDuplicate && !keywords.includes(title)) {
        keywords.push(title);
        history.push(title); // 현재 세션 히스토리에도 추가해서 중복 방지
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
    console.log(`📡 [${source.category}] 키워드 수집 중...`);
    const keywords = await fetchKeywordsFromSource(source, history);
    console.log(`  -> ${keywords.length}개 발견`);
    
    // 키워드 앞에 카테고리 태그 달기 (나중에 보기 편하게)
    const taggedKeywords = keywords.map(kw => `[${source.category}] ${kw}`);
    todayKeywords = todayKeywords.concat(taggedKeywords);
  }

  if (todayKeywords.length === 0) {
    console.log("\n⚠️ 오늘 새로 수집된 신규 키워드가 없습니다.");
    return;
  }

  console.log(`\n✅ 총 ${todayKeywords.length}개의 신선한 키워드가 수집되었습니다!`);

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
