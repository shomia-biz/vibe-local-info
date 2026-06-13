const fs = require('fs');
const path = require('path');
const utils = require('./fetch-utils');

async function fetchSeoulEvents() {
  utils.loadEnv();

  const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';
  const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const SEOUL_DATA_API_KEY = cleanKey(process.env.SEOUL_DATA_API_KEY);

  if (!GEMINI_API_KEY || !SEOUL_DATA_API_KEY) {
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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  };

  try {
    const seoulStart = Math.floor(Math.random() * 5) * 100 + 1;
    const seoulEnd = seoulStart + 10;
    const seoulUrl = `http://openAPI.seoul.go.kr:8088/${SEOUL_DATA_API_KEY}/json/culturalEventInfo/${seoulStart}/${seoulEnd}/`;
    const res = await fetch(seoulUrl, fetchOptions);
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
        const dateStr = utils.getRowStartDate(row);
        if (utils.isDateOlderThan30Days(dateStr)) return false;
        if (utils.isYearOutdated(row, row.TITLE)) return false;
        return row.TITLE && !utils.isDuplicateTitle(row.TITLE, existingNames);
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

  if (targetItems.length === 0) {
    console.log('새로운 신규 데이터가 감지되지 않았습니다.');
    return;
  }

  console.log(`\n🎉 총 ${targetItems.length}개의 신규 데이터를 발견하여 가공을 진행합니다.\n`);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const todayStr = new Date().toISOString().split('T')[0];

  for (const target of targetItems) {
    try {
      const { rawItem, source } = target;
      const itemName = utils.getRowName(rawItem, source);
      console.log(`🤖 [Gemini 정제 중...] 출처: ${source} | 명칭: ${itemName}`);

      // 평소에는 분당 20회 한도(3초당 1회)를 맞추기 위해 안전하게 4초 대기합니다.
      console.log(`⏳ [대기 중] API 무료 한도 준수를 위해 4초간 대기...`);
      await sleep(4000);

      const prompt = `아래 입력된 데이터 1건을 분석해서 규격화된 시스템용 JSON 데이터로 전환해줘.
      형식: {name: 서비스명또는행사명, category: '행사' 또는 '문화' 또는 '전시' 또는 '혜택', region: '서울' 또는 '경기' 또는 '인천' 또는 '전국', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 대상층, summary: 내용 요약설명, link: 링크주소}

      [필수 규칙 가라인]
      1. 출처 힌트 프로토콜: ${source}
      2. category 분류: 
         - 축제, 공연, 콘서트, 연주회, 스포츠 경기, 플리마켓 등 볼거리와 이벤트성 프로그램은 '행사'로 분류해.
         - 교육, 강좌, 체험 프로그램, 역사 탐방, 인문학 강의, 클래스 등 교육/체험 위주는 '문화'로 분류해.
         - 전시회, 미술전, 사진전, 박물관 기획전, 도서전 등 관람 위주는 '전시'로 분류해.
         - 지원금, 보조금, 혜택, 복지 서비스, 장학금 등은 '혜택'로 분류해.
      3. region 분류: 출처 힌트가 'GG_'로 시작하면 '경기', 'IC_'로 시작하면 '인천'으로, 출처가 'SEOUL_EVENT'이면 '서울'로 매핑하고, KTO_WELLNESS로 시작하는 출처는 데이터 내부의 addr1(주소)을 기반으로 서울/경기/인천/전국 중 알맞게 매핑해줘. 그 외에는 본문을 파악해 매칭해줘.
      4. startDate/endDate: 날짜 포맷은 무조건 'YYYY-MM-DD'로 처리해. 수치가 없으면 시작일은 오늘 날짜(${todayStr}), 종료일은 '상시'로 기입해.
      5. link: 소스 데이터 내에 URL 주소 필드가 마땅히 전무하면 공백문자("")로 선언해줘.

      불필요한 마크다운 백틱 문법이나 서론 생략하고 오로지 순수 유효 JSON 텍스트 한 덩어리만 반환해.\n\n데이터 소스: ${JSON.stringify(Object.assign({}, rawItem, { parsedName: itemName }))}`;

      let geminiResponse;
      let geminiResult = null;
      const backoffDelays = [30000, 60000, 120000];
      let attempt = 0;
      let isSuccess = false;

      // API 요청 지연 재시도 루프
      while (attempt < backoffDelays.length) {
        let errDetail = '';
        try {
          geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });

          // HTTP 상태 코드가 정상 코드가 아닐 경우 에러 처리
          if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`HTTP Error ${geminiResponse.status}: ${errText}`);
          }
          geminiResult = await geminiResponse.json();

          // 올바른 응답 구조가 들어왔는지 확인
          if (geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text) {
            isSuccess = true;
            break; // 성공 시 루프 즉시 탈출
          }

          errDetail = geminiResult.error ? geminiResult.error.message : '알 수 없는 응답 구조';
        } catch (fetchErr) {
          errDetail = fetchErr.message;
        }

        // 최대 재시도 횟수를 초과했으면 루프 종료
        if (attempt === backoffDelays.length) {
          break;
        }

        // 실패 시 지정된 백오프 시간만큼 대기 후 재시도
        const delay = backoffDelays[attempt];
        console.warn(`   ⚠️ Gemini API 한도 초과 또는 오류. ${delay / 1000}초 후 다시 시도합니다... (원인: ${errDetail})`);
        await sleep(delay);
        attempt++;
      }

      // 최종 실패 처리 (이 부분이 누락되면 아래에서 crash가 발생합니다)
      if (!isSuccess || !geminiResult) {
        console.error(`❌ Gemini AI 응답 오류: 3회 재시도 후에도 [${itemName}] 데이터를 가공하지 못했습니다.`);
        continue; // 다음 아이템(target)으로 안전하게 넘어감
      }

      // JSON 텍스트 추출 및 정제
      let aiText = geminiResult.candidates[0].content.parts[0].text;
      aiText = aiText.replace(/```json|```/g, '').trim();

      const processedItem = JSON.parse(aiText);

      if (processedItem.link) {
        console.log(`   🔍 원문 링크에서 대표 이미지 스크래핑 중...`);
        const scrapedImg = await utils.scrapeImageFromUrl(processedItem.link);
        if (scrapedImg) {
          processedItem.imageUrl = scrapedImg;
          console.log(`   📸 이미지 발견 완료: ${scrapedImg}`);
        } else {
          console.log(`   ℹ️ 대표 이미지를 발견하지 못했습니다. (기본 이미지 매칭 예정)`);
        }
      }

      if (processedItem.startDate && processedItem.startDate !== '상시') {
        if (utils.isDateOlderThan30Days(processedItem.startDate)) {
          console.log(`   ⚠️ [제외] 시작일(${processedItem.startDate})이 조회 기준 30일 이전이므로 가공에서 제외합니다. 명칭: ${processedItem.name}`);
          continue;
        }
      }

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

fetchSeoulEvents();
