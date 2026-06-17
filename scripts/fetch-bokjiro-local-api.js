const fs = require('fs');
const path = require('path');
const utils = require('./fetch-utils');

async function fetchData() {
  utils.loadEnv();

  const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';

  const BOKJIRO_API_KEY = cleanKey(process.env.BOKJIRO_API_KEY || process.env.PUBLIC_DATA_API_KEY);
  const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  if (!BOKJIRO_API_KEY || !GEMINI_API_KEY) {
    console.error('환경변수가 일부 설정되지 않았습니다. (.env.local 파일을 확인해 주세요)');
    return;
  }

  const MAX_ITEMS = 3;
  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  let localData;
  try {
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    localData = JSON.parse(fileContent);
  } catch (err) {
    console.error('기존 데이터를 읽는 중 오류 발생:', err);
    return;
  }

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
  const fetchOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  };

  try {
    const randomPage = Math.floor(Math.random() * 5) + 1;
    // 제공해주신 엔드포인트를 기반으로 추정한 URL입니다. Base URL이 다를 경우 이 부분을 수정해 주세요!
    const apiUrl = `https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist?serviceKey=${BOKJIRO_API_KEY}&pageNo=${randomPage}&numOfRows=50`;
    
    const response = await fetch(apiUrl, fetchOptions);
    const text = await response.text();
    let rawItems = [];

    // 복지로 API는 XML 또는 JSON으로 응답될 수 있으므로 둘 다 파싱 시도
    if (text.includes('<servList>')) {
      const itemRegex = /<servList>([\s\S]*?)<\/servList>/g;
      let match;
      while ((match = itemRegex.exec(text)) !== null) {
        const itemXml = match[1];
        const nameMatch = itemXml.match(/<servNm>(.*?)<\/servNm>/);
        const name = nameMatch ? nameMatch[1] : '';
        if (name) {
          rawItems.push({ xml: itemXml, servNm: name });
        }
      }
    } else {
      try {
        const result = JSON.parse(text);
        if (result.data) rawItems = result.data;
        else if (result.response && result.response.body && result.response.body.items) {
           rawItems = result.response.body.items.item || result.response.body.items.servList || [];
        } else if (result.servList) {
           rawItems = result.servList;
        } else {
           rawItems = result;
        }
      } catch (e) {
        console.error(`복지로(지자체) API 응답 파싱 실패:\n${text.substring(0, 100)}`);
      }
    }

    if (rawItems.length > 0) {
      console.log(`👀 [참고] 복지로(지자체) 서버에서 방금 가져온 데이터 목록 (총 ${rawItems.length}건, 랜덤선택: ${randomPage}페이지):`);
      console.log(rawItems.slice(0, 5).map((item, idx) => `   ${idx + 1}. ${item.servNm || item.서비스명 || '이름 없음'}`).join('\n') + (rawItems.length > 5 ? '\n   ... 등등' : ''));
    }

    const keywords = [
      '송파', '서울', '경기', '인천', '소상공인', '육아', '아동', '다자녀', '청소년', '학생', '청년', '출산', '창업', '전세사기', '유아', '영아', '장학금',
      '건강검진', '건강관리', '문화생활', '경로', '장애인', '부동산', '행정사무', '공공임대주택', '주택청약', '복지서비스', '지원금', '지원사업', '기초생활보장', '생계급여', '주거급여', '긴급복지지원',
      '국민취업지원', '고용보험', '실업급여', '건강보험', '국민연금', '국민건강보험', '건강보험공단', '국민취업지원', '월세', '친환경', '고경력', '창업자금', '양육비', '평생교육', '임산부', '영유아', '보육료',
      '금연클리닉', '보건소', '유휴간호사', '금연치료', '자산형성지원사업'
    ];

    const filteredItems = rawItems.filter(item => {
      const targetText = typeof item === 'string' ? item : JSON.stringify(item);
      return keywords.some(k => targetText.includes(k)) && !utils.commonExcludeKeywords.some(e => targetText.includes(e));
    });

    const freshItems = filteredItems.filter(item => {
      const name = item.servNm || item.서비스명 || item.name;
      if (!name) return false;
      return !utils.isDuplicateTitle(name, existingNames);
    });

    for (const item of freshItems) {
      if (targetItems.length < MAX_ITEMS) {
        targetItems.push({ rawItem: item, source: 'BOKJIRO_LOCAL' });
        existingNames.add(item.servNm || item.서비스명 || item.name);
      }
    }
  } catch (err) {
    console.error('복지로(지자체) 스캔 중 에러:', err.message);
  }

  if (targetItems.length === 0) {
    console.log('새로운 신규 데이터가 감지되지 않았습니다.');
    return;
  }

  console.log(`\n🎉 총 ${targetItems.length}개의 복지로(지자체) 신규 데이터를 발견하여 가공을 진행합니다.\n`);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const todayStr = new Date().toISOString().split('T')[0];

  for (const target of targetItems) {
    try {
      const { rawItem, source } = target;
      const itemName = rawItem.servNm || rawItem.서비스명 || '이름 없음';
      console.log(`🤖 [Gemini 정제 중...] 출처: ${source} | 명칭: ${itemName}`);

      console.log(`⏳ [대기 중] API 무료 한도 준수를 위해 4초간 대기...`);
      await sleep(4000);

      const prompt = `아래 입력된 지자체 복지 혜택 데이터 1건을 분석해서 규격화된 시스템용 JSON 데이터로 전환해줘.
      형식: {name: 혜택명, category: '혜택', region: '서울' 또는 '경기' 또는 '인천' 또는 '전국', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 주관지자체명, target: 대상층, summary: 혜택 요약설명, link: 링크주소}

      [필수 규칙 가이드라인]
      1. 출처 힌트 프로토콜: ${source}
      2. category 분류: '혜택'으로 고정해줘.
      3. region 분류: 지자체 복지서비스이므로 본문에 나오는 지역명(예: 서울시 00구, 경기도 00시 등)을 파악하여 '서울', '경기', '인천' 중 하나로 매칭해주고, 그 외 지역이거나 알 수 없으면 '전국'으로 해줘.
      4. startDate/endDate: 날짜 포맷은 무조건 'YYYY-MM-DD'로 처리해. 수치가 없으면 시작일은 오늘 날짜(${todayStr}), 종료일은 '상시'로 기입해.
      5. link: 소스 데이터 내에 URL 주소 필드가 마땅히 없거나 xml 태그면 공백문자("")로 선언해줘.

      불필요한 마크다운 백틱 문법이나 서론 생략하고 오로지 순수 유효 JSON 텍스트 한 덩어리만 반환해.\n\n데이터 소스: ${JSON.stringify(rawItem)}`;

      let geminiResponse;
      let geminiResult = null;
      const backoffDelays = [30000, 60000, 120000];
      let attempt = 0;
      let isSuccess = false;

      while (attempt < backoffDelays.length) {
        let errDetail = '';
        try {
          geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`HTTP Error ${geminiResponse.status}: ${errText}`);
          }

          geminiResult = await geminiResponse.json();

          if (geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text) {
            isSuccess = true;
            break;
          }

          errDetail = geminiResult.error ? geminiResult.error.message : '알 수 없는 응답 구조';
        } catch (fetchErr) {
          errDetail = fetchErr.message;
        }

        if (attempt === backoffDelays.length) {
          break;
        }

        const delay = backoffDelays[attempt];
        console.warn(`⚠️ Gemini API 한도 초과 또는 오류 (시도 ${attempt + 1}/${backoffDelays.length}). ${delay / 1000}초 후 다시 시도합니다... (원인: ${errDetail})`);
        await sleep(delay);
        attempt++;
      }

      if (!isSuccess || !geminiResult) {
        console.error(`❌ Gemini AI 응답 오류: 3회 재시도 후에도 [${itemName}] 데이터를 가공하지 못했습니다.`);
        continue;
      }

      let aiText = geminiResult.candidates[0].content.parts[0].text;
      aiText = aiText.replace(/```json|```/g, '').trim();

      const processedItem = JSON.parse(aiText);

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

      if (processedItem.category === '행사') {
        switch (processedItem.region) {
          case '서울': localData.seoulEvents.unshift(processedItem); break;
          case '경기': localData.kyeonggiEvents.unshift(processedItem); break;
          case '인천': localData.incheonEvents.unshift(processedItem); break;
          default: localData.nationalEvents.unshift(processedItem); break;
        }
      } else if (processedItem.category === '문화') {
        switch (processedItem.region) {
          case '서울': localData.seoulCultureEvents.unshift(processedItem); break;
          case '경기': localData.kyeonggiCultureEvents.unshift(processedItem); break;
          case '인천': localData.incheonCultureEvents.unshift(processedItem); break;
          default: localData.nationalCultureEvents.unshift(processedItem); break;
        }
      } else if (processedItem.category === '전시') {
        switch (processedItem.region) {
          case '서울': localData.seoulExhibitionEvents.unshift(processedItem); break;
          case '경기': localData.kyeonggiExhibitionEvents.unshift(processedItem); break;
          case '인천': localData.incheonExhibitionEvents.unshift(processedItem); break;
          default: localData.nationalExhibitionEvents.unshift(processedItem); break;
        }
      } else {
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

  try {
    fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`\n💾 local-info.json 파일에 최종 데이터를 안전하게 기록했습니다.`);
  } catch (saveErr) {
    console.error('❌ 파일 저장 중 오류 발생:', saveErr.message);
  }
}

fetchData();
