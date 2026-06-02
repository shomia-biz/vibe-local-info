const fs = require('fs');
const path = require('path');

// .env.local 파일에서 수동으로 API 키 읽어오기 (별도 도구 설치 없이 실행 가능)
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  } catch (err) {
    console.log('.env.local 파일을 읽는 중 참고사항 발생 (무시 가능)');
  }
}

// 공식 홈페이지 링크 주소에서 대표 이미지를 긁어오는 헬퍼 함수
async function scrapeImageFromUrl(url) {
  if (!url || !url.startsWith('http')) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // 1. Open Graph 이미지 태그 탐색
    const ogImageRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i;
    const ogImageRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i;
    let match = html.match(ogImageRegex) || html.match(ogImageRegexAlt);
    
    // 2. Twitter Card 이미지 태그 탐색
    if (!match) {
      const twitterImageRegex = /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i;
      const twitterImageRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i;
      match = html.match(twitterImageRegex) || html.match(twitterImageRegexAlt);
    }
    
    if (match && match[1]) {
      let imageUrl = match[1].trim();
      imageUrl = imageUrl.replace(/&amp;/g, '&');

      // 상대 경로 절대 경로 복원
      if (imageUrl.startsWith('//')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.protocol + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + imageUrl;
      } else if (!imageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + '/' + imageUrl;
      }
      return imageUrl;
    }
    
    // 3. 본문 첫 번째 이미지 태그 탐색
    const imgRegex = /<img[^>]*src=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      let imgUrl = imgMatch[1];
      if (imgUrl.includes('logo') || imgUrl.includes('icon') || imgUrl.includes('banner') || imgUrl.includes('header') || imgUrl.includes('footer')) {
        continue;
      }
      imgUrl = imgUrl.replace(/&amp;/g, '&');

      if (imgUrl.startsWith('//')) {
        const urlObj = new URL(url);
        imgUrl = urlObj.protocol + imgUrl;
      } else if (imgUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imgUrl = urlObj.origin + imgUrl;
      } else if (!imgUrl.startsWith('http')) {
        const urlObj = new URL(url);
        imgUrl = urlObj.origin + '/' + imgUrl;
      }
      return imgUrl;
    }
  } catch (error) {
    console.log(`   ⚠️ URL(${url}) 이미지 스크래핑 오류:`, error.message);
  }
  return null;
}

// 공공 API 종류별로 상이한 제목(Name) 필드를 표준화하여 추출해주는 헬퍼 함수
function getRowName(row, source) {
  if (!row) return '이름 없음';

  const upperRow = {};
  for (const key in row) {
    upperRow[key.toUpperCase()] = row[key];
  }

  // 1. 공통 표준 필드 탐색
  const commonKeys = ['TITLE', 'NAME', 'SUBJECT', '서비스명'];
  for (const key of commonKeys) {
    if (upperRow[key]) return upperRow[key].toString().trim();
  }

  // 2. 경기도 Open API 전용 매칭
  if (source && source.startsWith('GG_')) {
    if (source === 'GG_FESTIVAL') return (upperRow.FASTVL_NM || upperRow.FSTVL_NM || '').toString().trim();
    if (source === 'GG_EVENT') return (upperRow.TITLE || upperRow.EVENT_NM || '').toString().trim();
    if (source === 'GG_PERFORMANCE') return (upperRow.EVENT_TITLE || upperRow.PERFRM_NM || '').toString().trim();
    if (source === 'GG_KINTEX') return (upperRow.EVENT_NM_INFO || upperRow.EVENT_NM || '').toString().trim();
    if (source === 'GG_BENEFIT') {
      if (upperRow.SM_TITLE) return upperRow.SM_TITLE.toString().trim();
      if (upperRow.SIGUN_NM) {
        let bName = `${upperRow.SIGUN_NM.toString().trim()} 지원금`;
        if (upperRow.HFTM_DIV_NM) bName = `${upperRow.HFTM_DIV_NM.toString().trim()} ` + bName;
        if (upperRow.STD_YY) bName = `${upperRow.STD_YY.toString().trim()}년 ` + bName;
        return bName;
      }
    }

    // 경기도 범용 키 탐색
    const ggKeys = ['FASTVL_NM', 'TITLE', 'EVENT_TITLE', 'EVENT_NM_INFO', 'EVENT_NM', 'FSTVL_NM', 'PERFRM_NM', 'SM_TITLE'];
    for (const key of ggKeys) {
      if (upperRow[key]) return upperRow[key].toString().trim();
    }
  }

  // 3. 패턴 매칭 탐색 (_NM, _TITLE, _NAME 등으로 끝나는 키)
  for (const key in upperRow) {
    if (key.endsWith('_NM') || key.endsWith('_TITLE') || key.endsWith('_NAME') || key.endsWith('_INFO')) {
      if (upperRow[key]) return upperRow[key].toString().trim();
    }
  }

  return '이름 없음';
}

// 중복 판정을 위해 기수, 연도, 공통 수식어 등을 정규식으로 지우고 핵심 단어만 남겨서 변환하는 함수
function cleanTitleForComparison(title) {
  if (!title) return '';
  return title
    .replace(/\[[^\]]+\]/g, '') // 태그 제거
    .replace(/\([^)]+\)/g, '') // 괄호 제거
    .replace(/(20\d{2}|19\d{2})년?/g, '') // 연도 제거
    .replace(/제\s*\d+\s*회/g, '') // 기수 제거 (예: 제15회)
    .replace(/&amp;lt;[^&]+&amp;gt;/g, '') // HTML 엔티티 기호 제거
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '') // 특수문자 제거
    .replace(/\s+/g, '') // 공백 제거
    .replace(/(축제|예술제|문화제|페스티벌|공연|콘서트|전시회|전시|행사|캠프|아카데미|클래식|시리즈)/g, '') // 공통 명사 제거
    .trim();
}

// 제목 유사도를 분석하여 중복 데이터를 방지하는 똑똑한 함수
function isDuplicateTitle(newTitle, existingNames) {
  const cleanNew = cleanTitleForComparison(newTitle);
  if (!cleanNew || cleanNew.length < 3) return false;

  for (const existing of existingNames) {
    const cleanExisting = cleanTitleForComparison(existing);
    if (!cleanExisting || cleanExisting.length < 3) continue;

    // 1. 공백/기수 제거 후 제목이 완전히 동일할 때
    if (cleanNew === cleanExisting) return true;

    // 2. 글자 구성 단위 자카드 유사도 분석 (유사도가 70% 이상이면 유사 콘텐츠로 처리)
    const set1 = new Set(cleanNew.split(''));
    const set2 = new Set(cleanExisting.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const similarity = intersection.size / union.size;

    if (similarity >= 0.7) {
      // 3. 단, 코스모스 vs 유채꽃 처럼 서로 다른 성격의 꽃 키워드 등 핵심 고유명사가 다를 경우 오탐지 방어
      const keywords = ['코스모스', '유채꽃', '벚꽃', '거리극', '해맞이', '음악회'];
      for (const kw of keywords) {
        const hasNew = cleanNew.includes(kw);
        const hasExisting = cleanExisting.includes(kw);
        if (hasNew !== hasExisting) {
          return false; // 한쪽만 해당 고유명사를 포함하고 있다면 서로 다른 데이터임
        }
      }
      return true;
    }
  }
  return false;
}

// row 객체에서 시작일 날짜 필드를 지능적으로 찾아내는 함수
function getRowStartDate(row) {
  if (!row) return null;
  // 1. 알려진 대표적인 필드명 우선 체크
  const knownFields = [
    'BEGIN_DE', 'START_DE', 'STRT_DE',
    'FSTVL_START_DE', 'FSTVL_BEGIN_DE',
    'FASTVL_START_DE', 'FASTVL_BEGIN_DE',
    'PERFRM_START_DE', 'EVENT_START_DE',
    'sdate', 'STRTDATE', 'eventstartdate', 'startDate', '신청기간시작일'
  ];
  for (const field of knownFields) {
    if (row[field]) return row[field];
  }

  // 2. 키 이름 중에 START, BEGIN, STRT, DE 등이 포함되고 값이 6~10자(날짜 패턴)인 것 탐색
  const keys = Object.keys(row);
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('start') || lowerKey.includes('begin') || lowerKey.includes('strt') || lowerKey.endsWith('_de')) {
      const val = row[key];
      if (val && (typeof val === 'string' || typeof val === 'number')) {
        const valStr = val.toString().trim();
        if (/^\d{4}[-.]?\d{2}[-.]?\d{2}/.test(valStr)) {
          return valStr;
        }
      }
    }
  }
  return null;
}

// 데이터 내의 연도 필드(STD_YY 등)나 제목에 포함된 연도가 현재 연도보다 과거인지 체크하는 함수
function isYearOutdated(row, nameStr) {
  const currentYear = new Date().getFullYear();
  
  // 1. 객체 내 연도 필드 탐색
  for (const key in row) {
    if (key.toUpperCase() === 'STD_YY' || key.toUpperCase() === 'YEAR') {
      const year = parseInt(row[key], 10);
      if (!isNaN(year) && year < currentYear) {
        return true;
      }
    }
  }

  // 2. 제목에 적힌 연도 탐색 (예: "2024년 상반기 지원금")
  if (nameStr) {
    const match = nameStr.match(/(20\d{2})년/);
    if (match && match[1]) {
      const year = parseInt(match[1], 10);
      if (!isNaN(year) && year < currentYear) {
        return true;
      }
    }
  }

  return false;
}

// StartDate 가 조회 기준(오늘) 30일 이전인지 체크하는 함수
function isDateOlderThan30Days(dateStr) {
  if (!dateStr) return false;
  // YYYYMMDD 또는 YYYY.MM.DD 등의 형태 정규화
  let formattedStr = dateStr.toString().trim();
  // 공백이 포함된 경우 (예: "2026-05-19 00:00:00") 첫 번째 날짜 파트만 가져옴
  formattedStr = formattedStr.split(' ')[0];
  // . 을 - 로 치환
  formattedStr = formattedStr.replace(/\./g, '-');
  // YYYYMMDD 형태인 경우 YYYY-MM-DD 로 변환
  if (formattedStr.length === 8 && !formattedStr.includes('-')) {
    formattedStr = `${formattedStr.substring(0, 4)}-${formattedStr.substring(4, 6)}-${formattedStr.substring(6, 8)}`;
  }
  const itemDate = new Date(formattedStr);
  if (isNaN(itemDate.getTime())) return false;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  itemDate.setHours(0, 0, 0, 0);

  const diffTime = todayDate.getTime() - itemDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays > 30;
}

async function fetchData() {
  loadEnv(); // 환경변수 수동 로드

  const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';

  const PUBLIC_DATA_API_KEY = cleanKey(process.env.PUBLIC_DATA_API_KEY);
  const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const SEOUL_DATA_API_KEY = cleanKey(process.env.SEOUL_DATA_API_KEY);
  const KYEONGGI_DATA_API_KEY = cleanKey(process.env.KYEONGGI_DATA_API_KEY);
  // 오타 방지 (__ 기입 대응)
  const INCHEON_DATA_API_KEY = cleanKey(process.env.INCHEON_DATA_API_KEY || process.env.INCHEON_DATA_API__KEY);

  if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY || !SEOUL_DATA_API_KEY || !KYEONGGI_DATA_API_KEY || !INCHEON_DATA_API_KEY) {
    console.error('환경변수가 일부 설정되지 않았습니다. (.env.local 파일을 확인해 주세요)');
    return;
  }

  const MAX_ITEMS = 100;
  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  const defaultLocalData = {
    events: [], benefits: [],
    cultureEvents: [], seoulCultureEvents: [], kyeonggiCultureEvents: [], incheonCultureEvents: [], nationalCultureEvents: [],
    exhibitionEvents: [], seoulExhibitionEvents: [], kyeonggiExhibitionEvents: [], incheonExhibitionEvents: [], nationalExhibitionEvents: [],
    seoulEvents: [], kyeonggiEvents: [], incheonEvents: [], nationalEvents: [],
    seoulBenefits: [], kyeonggiBenefits: [], incheonBenefits: [], nationalBenefits: []
  };
  let localData = { ...defaultLocalData };

  try {
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(fileContent);
    localData = {
      events: parsed.events || [],
      benefits: parsed.benefits || [],
      cultureEvents: parsed.cultureEvents || [],
      seoulCultureEvents: parsed.seoulCultureEvents || [],
      kyeonggiCultureEvents: parsed.kyeonggiCultureEvents || [],
      incheonCultureEvents: parsed.incheonCultureEvents || [],
      nationalCultureEvents: parsed.nationalCultureEvents || [],
      exhibitionEvents: parsed.exhibitionEvents || [],
      seoulExhibitionEvents: parsed.seoulExhibitionEvents || [],
      kyeonggiExhibitionEvents: parsed.kyeonggiExhibitionEvents || [],
      incheonExhibitionEvents: parsed.incheonExhibitionEvents || [],
      nationalExhibitionEvents: parsed.nationalExhibitionEvents || [],
      seoulEvents: parsed.seoulEvents || [],
      kyeonggiEvents: parsed.kyeonggiEvents || [],
      incheonEvents: parsed.incheonEvents || [],
      nationalEvents: parsed.nationalEvents || [],
      seoulBenefits: parsed.seoulBenefits || [],
      kyeonggiBenefits: parsed.kyeonggiBenefits || [],
      incheonBenefits: parsed.incheonBenefits || [],
      nationalBenefits: parsed.nationalBenefits || []
    };
  } catch (err) {
    console.error('기존 데이터를 읽는 중 오류 발생:', err);
    return;
  }

  // 중복 제거용 매핑 테이블 통합 관리
  const existingNames = new Set([
    ...localData.events.map(e => e.name),
    ...localData.cultureEvents.map(e => e.name),
    ...localData.exhibitionEvents.map(e => e.name),
    ...localData.seoulEvents.map(s => s.name),
    ...localData.seoulCultureEvents.map(s => s.name),
    ...localData.seoulExhibitionEvents.map(s => s.name),
    ...localData.kyeonggiEvents.map(k => k.name),
    ...localData.kyeonggiCultureEvents.map(k => k.name),
    ...localData.kyeonggiExhibitionEvents.map(k => k.name),
    ...localData.incheonEvents.map(i => i.name),
    ...localData.incheonCultureEvents.map(i => i.name),
    ...localData.incheonExhibitionEvents.map(i => i.name),
    ...localData.nationalEvents.map(n => n.name),
    ...localData.nationalCultureEvents.map(n => n.name),
    ...localData.nationalExhibitionEvents.map(n => n.name),
    ...localData.benefits.map(b => b.name),
    ...localData.seoulBenefits.map(s => s.name),
    ...localData.kyeonggiBenefits.map(k => k.name),
    ...localData.incheonBenefits.map(i => i.name),
    ...localData.nationalBenefits.map(n => n.name)
  ]);

  const targetItems = [];

  // ========================================================
  // [1단계] 우선순위 채널 스캔 (전체 채널 강제 실행 및 로그 출력)
  // ========================================================

  // A. 정부24 스캔
  try {
    const gov24RandomPage = Math.floor(Math.random() * 10) + 1; // 1~10페이지 중 무작위 선택
    const publicDataUrl = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=${gov24RandomPage}&perPage=100&returnType=JSON&serviceKey=${PUBLIC_DATA_API_KEY}`;
    const response = await fetch(publicDataUrl);
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error(`정부24 API 응답 파싱 실패:\n${text.substring(0, 100)}`);
    }
    const rawItems = result.data || [];

    if (rawItems.length > 0) {
      console.log(`👀 [참고] 정부24 서버에서 방금 가져온 데이터 목록 (총 ${rawItems.length}건):`);
      console.log(rawItems.map((item, idx) => `   ${idx + 1}. ${item.서비스명 || '이름 없음'}`).join('\n'));
    }

    const keywords = ['송파', '서울', '경기', '인천', '소상공인', '육아', '아동', '다자녀', '청소년', '학생', '청년', '출산', '창업', '전세사기', '유아', '영아', '국가장학금', '건강', '문화생활', '경로', '장애인', '부동산', '행정사무', '공공임대주택', '주택청약', '복지', '지원', '기초생활보장', '생계급여', '주거급여', '긴급복지지원', '국민취업지원', '고용보험', '실업급여', '건강보험', '국민연금', '국민건강보험', '건강보험공단', '국민취업지원', '월세', '친환경'];
    const excludeKeywords = ['어업', '해운', '선박', '항만', '선원', '수산', '축산업', '축사', '임업', '농업', '해양사고', '방역', '경마', '경륜', '유기견', '유기묘', '보상', '동물보호', '해양', '북한이탈주민', '성매매', '국적상실', '국적회복', '국적취득', '소년원', '소년원법', '귀화'];

    const filteredItems = rawItems.filter(item => {
      const targetText = (item.서비스명 || '') + (item.서비스목적요약 || '') + (item.지원대상 || '') + (item.소관기관명 || '');
      return keywords.some(k => targetText.includes(k)) && !excludeKeywords.some(e => targetText.includes(e));
    });

    const freshItems = filteredItems.filter(item => {
      const dateStr = getRowStartDate(item);
      if (isDateOlderThan30Days(dateStr)) return false;
      if (isYearOutdated(item, item.서비스명)) return false;
      return item.서비스명 && !isDuplicateTitle(item.서비스명, existingNames);
    });
    for (const item of freshItems) {
      if (targetItems.length < MAX_ITEMS) {
        targetItems.push({ rawItem: item, source: 'GOV24' });
        existingNames.add(item.서비스명);
      }
    }
  } catch (err) {
    console.error('정부24 스캔 중 에러:', err.message);
  }

  // B. 경기도 오픈 API 스캔
  const ggRandomPage = Math.floor(Math.random() * 5) + 1; // 1~5페이지 중 무작위 선택
  const kyeonggiEndpoints = [
    { name: 'GG_FESTIVAL', url: `https://openapi.gg.go.kr/CultureFestival?KEY=${KYEONGGI_DATA_API_KEY}&Type=json&pIndex=${ggRandomPage}&pSize=50`, key: 'CultureFestival', nameField: 'FSTVL_NM' },
    { name: 'GG_EVENT', url: `https://openapi.gg.go.kr/GGCULTUREVENTSTUS?KEY=${KYEONGGI_DATA_API_KEY}&Type=json&pIndex=${ggRandomPage}&pSize=50`, key: 'GGCULTUREVENTSTUS', nameField: 'EVENT_NM' },
    { name: 'GG_PERFORMANCE', url: `https://openapi.gg.go.kr/PerformanceEvent?KEY=${KYEONGGI_DATA_API_KEY}&Type=json&pIndex=${ggRandomPage}&pSize=50`, key: 'PerformanceEvent', nameField: 'PERFRM_NM' },
    { name: 'GG_KINTEX', url: `https://openapi.gg.go.kr/KintexEventFixatn?KEY=${KYEONGGI_DATA_API_KEY}&Type=json&pIndex=${ggRandomPage}&pSize=50`, key: 'KintexEventFixatn', nameField: 'EVENT_NM' },
    { name: 'GG_BENEFIT', url: `https://openapi.gg.go.kr/GGYOUNGBGTRNSSAMTSTUS?KEY=${KYEONGGI_DATA_API_KEY}&Type=json&pIndex=${ggRandomPage}&pSize=50`, key: 'GGYOUNGBGTRNSSAMTSTUS', nameField: 'SM_TITLE' }
  ];

  for (const api of kyeonggiEndpoints) {
    try {
      const res = await fetch(api.url);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`경기도 API 응답 파싱 실패:\n${text.substring(0, 100)}`);
      }
      if (json[api.key] && json[api.key][1] && json[api.key][1].row) {
        const rows = json[api.key][1].row;
        console.log(`👀 [참고] 경기도 ${api.name} 서버에서 방금 가져온 데이터 목록 (총 ${rows.length}건):`);
        console.log(rows.map((row, idx) => `   ${idx + 1}. ${getRowName(row, api.name)}`).join('\n'));

        const freshGG = rows.filter(row => {
          const name = getRowName(row, api.name);
          const dateStr = getRowStartDate(row);
          if (isDateOlderThan30Days(dateStr)) return false;
          if (isYearOutdated(row, name)) return false;
          return name && name !== '이름 없음' && !isDuplicateTitle(name, existingNames);
        });
        for (const row of freshGG) {
          if (targetItems.length < MAX_ITEMS) {
            targetItems.push({ rawItem: row, source: api.name });
            existingNames.add(getRowName(row, api.name));
          }
        }
      } else {
        const errorMsg = json.RESULT ? `${json.RESULT.CODE}: ${json.RESULT.MESSAGE}` : JSON.stringify(json);
        console.log(`⚠️ [참고] 경기도 ${api.name} 서버 응답 결과: ${errorMsg}`);
      }
    } catch (err) {
      console.error(`경기도 ${api.name} 스캔 실패:`, err.message);
    }
  }

  // C. 인천문화재단 API 스캔
  const incheonEndpoints = [
    { name: 'IC_CULTURE', url: `https://ifac.or.kr/openAPI/real/search.do?apiKey=${INCHEON_DATA_API_KEY}&svID=culture&resultType=json` },
    { name: 'IC_FESTIVAL', url: `https://ifac.or.kr/openAPI/real/search.do?apiKey=${INCHEON_DATA_API_KEY}&svID=festival&resultType=json` }
  ];

  for (const api of incheonEndpoints) {
    try {
      const res = await fetch(api.url);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`인천 API 응답 파싱 실패:\n${text.substring(0, 100)}`);
      }
      let icRows = [];
      if (Array.isArray(json)) {
        if (json[0] && Array.isArray(json[0].item)) {
          icRows = json[0].item;
        } else if (json[0] && Array.isArray(json[0].data)) {
          icRows = json[0].data;
        }
      } else if (json) {
        icRows = json.data || json.list || json.row || (json.item ? (Array.isArray(json.item) ? json.item : [json.item]) : []);
      }

      if (Array.isArray(icRows) && icRows.length > 0) {
        console.log(`👀 [참고] 인천 ${api.name} 서버에서 방금 가져온 데이터 목록 (총 ${icRows.length}건):`);
        console.log(icRows.map((row, idx) => `   ${idx + 1}. ${getRowName(row, api.name)}`).join('\n'));

        const freshIC = icRows.filter(row => {
          const name = getRowName(row, api.name);
          const dateStr = getRowStartDate(row);
          if (isDateOlderThan30Days(dateStr)) return false;
          if (isYearOutdated(row, name)) return false;
          return name && name !== '이름 없음' && !isDuplicateTitle(name, existingNames);
        });
        for (const row of freshIC) {
          if (targetItems.length < MAX_ITEMS) {
            targetItems.push({ rawItem: row, source: api.name });
            existingNames.add(getRowName(row, api.name));
          }
        }
      } else {
        console.log(`⚠️ [참고] 인천 ${api.name} 서버 응답 결과: 데이터가 없거나 형식이 올바르지 않습니다. (응답: ${JSON.stringify(json)})`);
      }
    } catch (err) {
      console.error(`인천 API 스캔 에러 (${api.name}):`, err.message);
    }
  }

  // D. 서울시 문화행사 API 스캔
  try {
    const seoulStart = Math.floor(Math.random() * 5) * 100 + 1; // 1, 101, 201, 301, 401 중 무작위 선택
    const seoulEnd = seoulStart + 99;
    const seoulUrl = `http://openAPI.seoul.go.kr:8088/${SEOUL_DATA_API_KEY}/json/culturalEventInfo/${seoulStart}/${seoulEnd}/`;
    const res = await fetch(seoulUrl);
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`서울 API 응답 파싱 실패:\n${text.substring(0, 100)}`);
    }
    if (json.culturalEventInfo && json.culturalEventInfo.row) {
      const rows = json.culturalEventInfo.row;
      console.log(`👀 [참고] 서울시 API 서버에서 방금 가져온 데이터 목록 (총 ${rows.length}건):`);
      console.log(rows.map((row, idx) => `   ${idx + 1}. ${row.TITLE || '이름 없음'}`).join('\n'));

      const freshSeoul = rows.filter(row => {
        const dateStr = getRowStartDate(row);
        if (isDateOlderThan30Days(dateStr)) return false;
        if (isYearOutdated(row, row.TITLE)) return false;
        return row.TITLE && !isDuplicateTitle(row.TITLE, existingNames);
      });
      for (const row of freshSeoul) {
        if (targetItems.length < MAX_ITEMS) {
          targetItems.push({ rawItem: row, source: 'SEOUL_EVENT' });
          existingNames.add(row.TITLE);
        }
      }
    } else {
      const errMsg = json.RESULT ? `${json.RESULT.CODE}: ${json.RESULT.MESSAGE}` : JSON.stringify(json);
      console.log(`⚠️ [참고] 서울시 API 서버 응답 결과: ${errMsg}`);
    }
  } catch (err) {
    console.error('서울 API 스캔 에러:', err.message);
  }

  // E. 한국관광공사 웰니스관광 API 스캔 (contentTypeId: 12, 14, 15 순환 스캔)
  const ktoRandomPage = Math.floor(Math.random() * 3) + 1; // 1~3페이지 중 무작위 선택
  const typeIds = ['12', '14', '15'];
  for (const typeId of typeIds) {
    try {
      // arrange=D 로 변경하여 최신 등록순으로 가져옵니다.
      const wellnessUrl = `http://apis.data.go.kr/B551011/WellnessTursmService/areaBasedList?serviceKey=${PUBLIC_DATA_API_KEY}&numOfRows=50&pageNo=${ktoRandomPage}&MobileOS=ETC&MobileApp=AppTest&langDivCd=KOR&contentTypeId=${typeId}&arrange=D&_type=json`;
      const res = await fetch(wellnessUrl);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error(`웰니스 API (contentTypeId: ${typeId}) 응답 파싱 실패:\n${text.substring(0, 100)}`);
      }
      if (json.response && json.response.body && json.response.body.items && json.response.body.items.item) {
        let items = json.response.body.items.item;
        if (!Array.isArray(items)) {
          items = [items];
        }
        console.log(`👀 [참고] 한국관광공사 웰니스 API (contentTypeId: ${typeId}) 서버에서 방금 가져온 데이터 목록 (총 ${items.length}건):`);
        console.log(items.map((item, idx) => `   ${idx + 1}. ${item.title || '이름 없음'}`).join('\n'));

        const freshWellness = items.filter(item => {
          const dateStr = getRowStartDate(item);
          if (isDateOlderThan30Days(dateStr)) return false;
          if (isYearOutdated(item, item.title)) return false;
          return item.title && !isDuplicateTitle(item.title, existingNames);
        });
        for (const item of freshWellness) {
          if (targetItems.length < MAX_ITEMS) {
            targetItems.push({ rawItem: item, source: `KTO_WELLNESS_${typeId}` });
            existingNames.add(item.title);
          }
        }
      } else {
        const errMsg = json.response && json.response.header ? `${json.response.header.resultCode}: ${json.response.header.resultMsg}` : JSON.stringify(json);
        console.log(`⚠️ [참고] 한국관광공사 웰니스 API (contentTypeId: ${typeId}) 서버 응답 결과: ${errMsg}`);
      }
    } catch (err) {
      console.error(`한국관광공사 웰니스 API (contentTypeId: ${typeId}) 스캔 에러:`, err.message);
    }
  }

  if (targetItems.length === 0) {
    console.log('새로운 신규 데이터가 감지되지 않았습니다.');
    return;
  }

  console.log(`\n🎉 총 ${targetItems.length}개의 신규 데이터를 발견하여 가공을 진행합니다.\n`);

  // ========================================================
  // [2단계] Gemini AI로 데이터 규격 대통합 정제
  // ========================================================
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const todayStr = new Date().toISOString().split('T')[0];

  for (const target of targetItems) {
    try {
      const { rawItem, source } = target;
      const itemName = getRowName(rawItem, source);
      console.log(`🤖 [Gemini 정제 중...] 출처: ${source} | 명칭: ${itemName}`);

      // 무료 AI 사용량 제한(1분당 15회)을 초과하지 않도록, 호출 전에 4.2초씩 안전하게 쉬어갑니다.
      await sleep(4200);

      const prompt = `아래 입력된 데이터 1건을 분석해서 규격화된 시스템용 JSON 데이터로 전환해줘.
      형식: {name: 서비스명또는행사명, category: '행사' 또는 '문화' 또는 '전시' 또는 '혜택', region: '서울' 또는 '경기' 또는 '인천' 또는 '전국', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 대상층, summary: 내용 요약설명, link: 링크주소}

      [필수 규칙 가라인]
      1. 출처 힌트 프로토콜: ${source}
      2. category 분류: 
         - 축제, 공연, 콘서트, 연주회, 스포츠 경기, 플리마켓 등 볼거리와 이벤트성 프로그램은 '행사'로 분류해.
         - 교육, 강좌, 체험 프로그램, 역사 탐방, 인문학 강의, 클래스 등 교육/체험 위주는 '문화'로 분류해.
         - 전시회, 미술전, 사진전, 박물관 기획전, 도서전 등 관람 위주는 '전시'로 분류해.
         - 지원금, 보조금, 혜택, 복지 서비스, 장학금 등은 '혜택'으로 분류해.
      3. region 분류: 출처 힌트가 'GG_'로 시작하면 '경기', 'IC_'로 시작하면 '인천'으로, 출처가 'SEOUL_EVENT'이면 '서울'로 매핑하고, KTO_WELLNESS로 시작하는 출처는 데이터 내부의 addr1(주소)을 기반으로 서울/경기/인천/전국 중 알맞게 매핑해줘. 그 외에는 본문을 파악해 매칭해줘.
      4. startDate/endDate: 날짜 포맷은 무조건 'YYYY-MM-DD'로 처리해. 수치가 없으면 시작일은 오늘 날짜(${todayStr}), 종료일은 '상시'로 기입해.
      5. link: 소스 데이터 내에 URL 주소 필드가 마땅히 전무하면 공백문자("")로 선언해줘.

      불필요한 마크다운 백틱 문법이나 서론 생략하고 오로지 순수 유효 JSON 텍스트 한 덩어리만 반환해.\n\n데이터 소스: ${JSON.stringify(Object.assign({}, rawItem, { parsedName: itemName }))}`;

      let geminiResponse;
      let geminiResult;
      let retries = 3;

      while (retries > 0) {
        let errDetail = '';
        try {
          geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          geminiResult = await geminiResponse.json();

          if (geminiResult.candidates && geminiResult.candidates.length > 0) {
            break; // 성공적으로 응답을 받았다면 재시도 루프를 빠져나갑니다.
          }
          
          errDetail = geminiResult.error ? geminiResult.error.message : JSON.stringify(geminiResult);
          console.warn(`   ⚠️ Gemini API 요청 실패 (남은 시도: ${retries - 1}회). 원인: ${errDetail}`);
        } catch (fetchErr) {
          errDetail = fetchErr.message;
          console.warn(`   ⚠️ Gemini API 통신 오류 (남은 시도: ${retries - 1}회). 원인: ${errDetail}`);
        }

        retries--;
        if (retries > 0) {
          let waitMs = 5000; // 기본 대기 시간 5초
          if (errDetail.includes('Please retry in')) {
            const match = errDetail.match(/Please retry in ([\d\.]+)\s*s/);
            if (match && match[1]) {
              // API가 안내해 준 잔여 대기 시간에 1.5초 여유를 더해 안전하게 대기합니다.
              waitMs = (parseFloat(match[1]) + 1.5) * 1000;
              console.log(`   ⏳ API 사용량 초과! 안전을 위해 안내된 시간(${match[1]}초)보다 조금 더 넉넉히 대기합니다 (${(waitMs / 1000).toFixed(1)}초 대기)...`);
            } else {
              console.log(`   ⏳ 5초 후에 다시 시도합니다...`);
            }
          } else {
            console.log(`   ⏳ 5초 후에 다시 시도합니다...`);
          }
          await sleep(waitMs);
        }
      }

      if (!geminiResult || !geminiResult.candidates || geminiResult.candidates.length === 0) {
        console.error(`❌ Gemini AI 응답 오류 (${itemName} 데이터를 최종적으로 가공하지 못했습니다)`);
        continue;
      }

      let aiText = geminiResult.candidates[0].content.parts[0].text;
      aiText = aiText.replace(/```json|```/g, '').trim();

      const processedItem = JSON.parse(aiText);

      // 공식 홈페이지(link)로부터 실제 포스터/대표 이미지 크롤링 시도
      if (processedItem.link) {
        console.log(`   🔍 원문 링크에서 대표 이미지 스크래핑 중...`);
        const scrapedImg = await scrapeImageFromUrl(processedItem.link);
        if (scrapedImg) {
          processedItem.imageUrl = scrapedImg;
          console.log(`   📸 이미지 발견 완료: ${scrapedImg}`);
        } else {
          console.log(`   ℹ️ 대표 이미지를 발견하지 못했습니다. (기본 이미지 매칭 예정)`);
        }
      }

      // StartDate가 조회 기준 30일 이전인 경우 가져오지 않음 (최종 검증)
      if (processedItem.startDate && processedItem.startDate !== '상시') {
        if (isDateOlderThan30Days(processedItem.startDate)) {
          console.log(`   ⚠️ [제외] 시작일(${processedItem.startDate})이 조회 기준 30일 이전이므로 가공에서 제외합니다. 명칭: ${processedItem.name}`);
          continue;
        }
      }

      // ========================================================
      // [3단계] 메타 필드 조율 및 인덱싱 가공
      // ========================================================
      const allLists = [
        ...localData.events, ...localData.benefits,
        ...localData.cultureEvents, ...localData.exhibitionEvents,
        ...localData.seoulEvents, ...localData.kyeonggiEvents, ...localData.incheonEvents, ...localData.nationalEvents,
        ...localData.seoulCultureEvents, ...localData.kyeonggiCultureEvents, ...localData.incheonCultureEvents, ...localData.nationalCultureEvents,
        ...localData.seoulExhibitionEvents, ...localData.kyeonggiExhibitionEvents, ...localData.incheonExhibitionEvents, ...localData.nationalExhibitionEvents,
        ...localData.seoulBenefits, ...localData.kyeonggiBenefits, ...localData.incheonBenefits, ...localData.nationalBenefits
      ];
      const maxId = allLists.reduce((max, item) => Math.max(max, item.id || 0), 0);

      processedItem.id = maxId + 1;
      processedItem.updatedAt = new Date().toISOString().split('T')[0];

      // ========================================================
      // [4단계] 통합 및 지역 타겟 세부 분기 적재
      // ========================================================
      if (processedItem.category === '행사') {
        localData.events.unshift(processedItem);
        switch (processedItem.region) {
          case '서울': localData.seoulEvents.unshift(processedItem); break;
          case '경기': localData.kyeonggiEvents.unshift(processedItem); break;
          case '인천': localData.incheonEvents.unshift(processedItem); break;
          default: localData.nationalEvents.unshift(processedItem); break;
        }
      } else if (processedItem.category === '문화') {
        localData.cultureEvents.unshift(processedItem);
        switch (processedItem.region) {
          case '서울': localData.seoulCultureEvents.unshift(processedItem); break;
          case '경기': localData.kyeonggiCultureEvents.unshift(processedItem); break;
          case '인천': localData.incheonCultureEvents.unshift(processedItem); break;
          default: localData.nationalCultureEvents.unshift(processedItem); break;
        }
      } else if (processedItem.category === '전시') {
        localData.exhibitionEvents.unshift(processedItem);
        switch (processedItem.region) {
          case '서울': localData.seoulExhibitionEvents.unshift(processedItem); break;
          case '경기': localData.kyeonggiExhibitionEvents.unshift(processedItem); break;
          case '인천': localData.incheonExhibitionEvents.unshift(processedItem); break;
          default: localData.nationalExhibitionEvents.unshift(processedItem); break;
        }
      } else {
        localData.benefits.unshift(processedItem);
        switch (processedItem.region) {
          case '서울': localData.seoulBenefits.unshift(processedItem); break;
          case '경기': localData.kyeonggiBenefits.unshift(processedItem); break;
          case '인천': localData.incheonBenefits.unshift(processedItem); break;
          default: localData.nationalBenefits.unshift(processedItem); break;
        }
      }

      console.log(`   ✅ 수집 완료: [출처: ${source}] -> [분류: ${processedItem.category} / ${processedItem.region}] 명칭: ${processedItem.name}`);

    } catch (err) {
      console.error(`❌ [가공 오류] 데이터 가공 중 에러:`, err.message);
    }
  }

  // 파일 영구 저장
  try {
    fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`\n💾 local-info.json 파일에 최종 데이터를 안전하게 기록했습니다.`);
  } catch (saveErr) {
    console.error('❌ 파일 저장 중 오류 발생:', saveErr.message);
  }
}

fetchData();