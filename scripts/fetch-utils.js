const fs = require('fs');
const path = require('path');

// .env.local 파일에서 수동으로 API 키 읽어오기
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

    const ogImageRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i;
    const ogImageRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i;
    let match = html.match(ogImageRegex) || html.match(ogImageRegexAlt);

    if (!match) {
      const twitterImageRegex = /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i;
      const twitterImageRegexAlt = /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i;
      match = html.match(twitterImageRegex) || html.match(twitterImageRegexAlt);
    }

    if (match && match[1]) {
      let imageUrl = match[1].trim();
      imageUrl = imageUrl.replace(/&amp;/g, '&');
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

// 제목 표준화
function getRowName(row, source) {
  if (!row) return '이름 없음';
  const upperRow = {};
  for (const key in row) {
    upperRow[key.toUpperCase()] = row[key];
  }
  const commonKeys = ['TITLE', 'NAME', 'SUBJECT', '서비스명'];
  for (const key of commonKeys) {
    if (upperRow[key]) return upperRow[key].toString().trim();
  }
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
    const ggKeys = ['FASTVL_NM', 'TITLE', 'EVENT_TITLE', 'EVENT_NM_INFO', 'EVENT_NM', 'FSTVL_NM', 'PERFRM_NM', 'SM_TITLE'];
    for (const key of ggKeys) {
      if (upperRow[key]) return upperRow[key].toString().trim();
    }
  }
  for (const key in upperRow) {
    if (key.endsWith('_NM') || key.endsWith('_TITLE') || key.endsWith('_NAME') || key.endsWith('_INFO')) {
      if (upperRow[key]) return upperRow[key].toString().trim();
    }
  }
  return '이름 없음';
}

function cleanTitleForComparison(title) {
  if (!title) return '';
  return title
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\([^)]+\)/g, '')
    .replace(/(20\d{2}|19\d{2})년?/g, '')
    .replace(/제\s*\d+\s*회/g, '')
    .replace(/&amp;lt;[^&]+&amp;gt;/g, '')
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    .replace(/\s+/g, '')
    .replace(/(축제|예술제|문화제|페스티벌|공연|콘서트|전시회|전시|행사|캠프|아카데미|클래식|시리즈)/g, '')
    .trim();
}

function isDuplicateTitle(newTitle, existingNames) {
  if (!newTitle) return false;

  // 1. 원본 기준 완벽 동일 여부 검사 (띄어쓰기, 대소문자 무시)
  const exactNew = newTitle.replace(/\s+/g, '').toLowerCase();
  for (const existing of existingNames) {
    if (existing && exactNew === existing.replace(/\s+/g, '').toLowerCase()) return true;
  }

  // 2. 특수기호만 제거한 상태에서 동일 여부 검사
  const basicClean = (str) => str.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣]/g, '').toLowerCase();
  const basicNew = basicClean(newTitle);
  for (const existing of existingNames) {
    if (existing && basicNew === basicClean(existing)) return true;
  }

  // 3. 기존의 복잡한 유사도 검사 (단어가 너무 많이 잘려서 짧아질 경우를 대비해 위에서 1, 2단계를 먼저 거침)
  const cleanNew = cleanTitleForComparison(newTitle);
  if (!cleanNew || cleanNew.length < 3) return false;
  
  for (const existing of existingNames) {
    const cleanExisting = cleanTitleForComparison(existing);
    if (!cleanExisting || cleanExisting.length < 3) continue;
    if (cleanNew === cleanExisting) return true;
    
    const set1 = new Set(cleanNew.split(''));
    const set2 = new Set(cleanExisting.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const similarity = intersection.size / union.size;
    
    if (similarity >= 0.7) {
      const keywords = ['코스모스', '유채꽃', '벚꽃', '거리극', '해맞이', '음악회'];
      let keywordMismatch = false;
      for (const kw of keywords) {
        if (cleanNew.includes(kw) !== cleanExisting.includes(kw)) {
          keywordMismatch = true;
          break;
        }
      }
      if (!keywordMismatch) return true;
    }
  }
  return false;
}

function getRowStartDate(row) {
  if (!row) return null;
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

function isYearOutdated(row, nameStr) {
  const currentYear = new Date().getFullYear();
  for (const key in row) {
    if (key.toUpperCase() === 'STD_YY' || key.toUpperCase() === 'YEAR') {
      const year = parseInt(row[key], 10);
      if (!isNaN(year) && year < currentYear) {
        return true;
      }
    }
  }
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

function isDateOlderThan30Days(dateStr) {
  if (!dateStr) return false;
  let formattedStr = dateStr.toString().trim();
  formattedStr = formattedStr.split(' ')[0];
  formattedStr = formattedStr.replace(/\./g, '-');
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

function getRowEndDate(row) {
  if (!row) return null;
  const knownFields = [
    'END_DE', 'FSTVL_END_DE', 'FASTVL_END_DE',
    'PERFRM_END_DE', 'EVENT_END_DE',
    'edate', 'ENDDATE', 'eventenddate', 'endDate', '신청기간종료일'
  ];
  for (const field of knownFields) {
    if (row[field]) return row[field];
  }
  const keys = Object.keys(row);
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('end')) {
      const val = row[key];
      if (val && (typeof val === 'string' || typeof val === 'number')) {
        return val.toString().trim();
      }
    }
  }
  return null;
}

function isDatePassed(dateStr) {
  if (!dateStr || dateStr === '상시') return false;
  let formattedStr = dateStr.toString().trim();
  formattedStr = formattedStr.split(' ')[0];
  formattedStr = formattedStr.replace(/\./g, '-');
  if (formattedStr.length === 8 && !formattedStr.includes('-')) {
    formattedStr = `${formattedStr.substring(0, 4)}-${formattedStr.substring(4, 6)}-${formattedStr.substring(6, 8)}`;
  }
  const itemDate = new Date(formattedStr);
  if (isNaN(itemDate.getTime())) return false;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  itemDate.setHours(0, 0, 0, 0);
  return itemDate.getTime() < todayDate.getTime();
}

const commonExcludeKeywords = [
  '영산강섬진강수계', '금속광산', '어업', '해운', '선박', '항만', '선원', '수산', '축산업', '축사', '임업', '농업', '해양사고', '방역', '경마', '경륜', '유기견', '유기묘', '보상',
  '동물보호', '해양', '북한이탈주민', '성매매', '국적상실', '국적회복', '국적취득', '소년원', '소년원법', '귀화', '농가', '수의사', '구제역', '송아지',
  '브루셀라병', '공동방제단', '공공급식', '농촌맞춤형', '농촌아이돌봄지원', '농번기돌봄지원', '농촌형', '후계농업경영인', '전통발효식품', '과수거점산지',
  '과실브랜드', '과실전문', '고품질쌀유통', '미곡종합처리장', '도매유통활성화', '축산관련종사자', '인삼', '농산물', '산지유통', '국내채종', '친환경농산물',
  '밭작물', '동물용', '저탄소', '중소식품기업', '가축개량', '농식품', '살처분', '농지연금', '농촌융복합산업', '예방약품', '방역장비', '해외인증', '귀농',
  '귀촌', '공영도매시장', 'GAP', '대체초지조성비', '가축전염병', '농기계', '농촌', '경영회생지원', '농가사료', '외식기업', '꿀벌질병', '전략작물', '친환경퇴비',
  '경관보전', '이민여성', '산지저온', '화훼류', '습식유통', '과수', '식생활', '유기농업', '축산', '외식업체', '국제식품', '조사료', '농수산', '농기자재',
  '농업인', '임대', '농장', 'FA분야', '곤충산업', '축산악취', '스마트팜', '장애', '체육인', '도박문제', '글로벌', '이민예정자', '가정폭력', '한부모가족', '폭력', '피해',
  '이주여성', '다문화가족', '북한이탈여성', '디지털성범죄', '한부모', '고립', '은둔', '경력보유여성', '저소득', '다문화',
  '산불전문', '국가유공자', '유휴토지', '산림사업', '목재', '임업용', '치유의숲', '산림탄소', '사립휴양시설', '산림복지', '숲사랑지도원', '임업인', '귀산촌인',
  '백두대간', '산림소유자', '숲가꾸기', '조림지원', '임도', '임산물', '산사태', '국립수목원', '중소기업', '직업계고', '판로진출지원', '협동화사업', '자금융자',
  '전통시장', '맞춤형', '재창업기업', '벤처', '온누리상품권', 'M&A', '수출컨소시엄', '공공연', '신진연구', '기술보증',
  '산업전', '기술전', '기자재전', '물류', '보안', '테스팅', '의약품', '화학장치', '포장기자재', '솔루션'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchGeminiWithFallback(prompt, apiKey, type = 'fetch') {
  const fetchModels = [
    'gemini-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-lite-latest',
    'gemini-1.5-flash-8b'
  ];
  const blogModels = [
    'gemini-pro-latest',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-2.0-flash'
  ];
  const models = type === 'blog' ? blogModels : fetchModels;
  const backoffDelays = [30000, 60000, 120000];
  let attempt = 0;
  let modelIndex = 0;
  let lastErrDetail = '';

  while (modelIndex < models.length) {
    const currentModel = models[modelIndex];
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let geminiResponse;
      try {
        geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        throw new Error(`HTTP Error ${geminiResponse.status}: ${errText}`);
      }

      const geminiResult = await geminiResponse.json();

      if (geminiResult.usageMetadata) {
        const usage = geminiResult.usageMetadata;
        console.log(`\n📊 [토큰 사용량] 입력: ${usage.promptTokenCount}개 / 출력: ${usage.candidatesTokenCount}개 / 총합: ${usage.totalTokenCount}개`);
      }

      if (geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const endTime = Date.now();
        console.log(`   ⏱️ [${currentModel}] 응답 완료: ${((endTime - startTime) / 1000).toFixed(2)}초 소요`);
        return geminiResult;
      }
      throw new Error(geminiResult.error ? geminiResult.error.message : '알 수 없는 응답 구조');

    } catch (fetchErr) {
      lastErrDetail = fetchErr.message;

      if (lastErrDetail.includes('429') || lastErrDetail.includes('Quota') || lastErrDetail.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   🔄 [${currentModel}] 한도 초과 감지! 다음 모델로 즉시 교체합니다...`);
        modelIndex++;
        attempt = 0;
        continue;
      }
    }

    if (attempt >= backoffDelays.length) {
      console.log(`   ⚠️ [${currentModel}] 재시도 초과. 다음 모델로 교체합니다...`);
      modelIndex++;
      attempt = 0;
      continue;
    }

    const delay = backoffDelays[attempt];
    console.log(`   ⚠️ [${currentModel}] API 오류. ${delay / 1000}초 후 다시 시도합니다... (원인: ${lastErrDetail})`);
    await sleep(delay);
    attempt++;
  }

  throw new Error(`모든 모델(${models.length}개)의 시도가 실패했습니다. 마지막 오류: ${lastErrDetail}`);
}

module.exports = {
  loadEnv,
  scrapeImageFromUrl,
  getRowName,
  cleanTitleForComparison,
  isDuplicateTitle,
  getRowStartDate,
  isYearOutdated,
  isDateOlderThan30Days,
  getRowEndDate,
  isDatePassed,
  commonExcludeKeywords,
  fetchGeminiWithFallback,
  sleep
};
