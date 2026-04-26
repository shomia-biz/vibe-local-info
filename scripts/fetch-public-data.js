const fs = require('fs');
const path = require('path');

async function fetchData() {
  const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY) {
    console.error('환경변수(PUBLIC_DATA_API_KEY 또는 GEMINI_API_KEY)가 설정되지 않았습니다.');
    return;
  }

  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  let localData = { events: [], benefits: [], seoulEvents: [], nationalEvents: [] };

  try {
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    localData = JSON.parse(fileContent);
  } catch (err) {
    console.error('기존 데이터를 읽는 중 오류 발생:', err);
    return;
  }

  // [1단계] 공공데이터 가져오기
  const publicDataUrl = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${PUBLIC_DATA_API_KEY}`;
  
  try {
    const response = await fetch(publicDataUrl);
    const result = await response.json();
    const rawItems = result.data || [];

    // 필터링 로직
    let filteredItems = rawItems.filter(item => 
      (item.서비스명 || '').includes('송파') || 
      (item.서비스목적요약 || '').includes('송파') || 
      (item.지원대상 || '').includes('송파') || 
      (item.소관기관명 || '').includes('송파')
    );

    if (filteredItems.length === 0) {
      filteredItems = rawItems.filter(item => 
        (item.서비스명 || '').includes('서울') || 
        (item.서비스목적요약 || '').includes('서울') || 
        (item.지원대상 || '').includes('서울') || 
        (item.소관기관명 || '').includes('서울')
      );
    }

    if (filteredItems.length === 0) {
      filteredItems = rawItems;
    }

    // [2단계] 기존 데이터와 비교 (중복 제거)
    const existingNames = new Set([
      ...localData.events.map(e => e.name),
      ...localData.benefits.map(b => b.name),
      ...localData.seoulEvents.map(s => s.name),
      ...localData.nationalEvents.map(n => n.name)
    ]);

    const newItem = filteredItems.find(item => !existingNames.has(item.서비스명));

    if (!newItem) {
      console.log('새로운 데이터가 없습니다.');
      return;
    }

    // [3단계] Gemini AI로 가공
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식: {id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL} category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해. startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어. 반드시 JSON 객체만 출력해. 다른 텍스트 없이.\n\n공공데이터: ${JSON.stringify(newItem)}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const geminiResult = await geminiResponse.json();
    let aiText = geminiResult.candidates[0].content.parts[0].text;
    
    // JSON 부분만 추출 (마크다운 제거)
    aiText = aiText.replace(/```json|```/g, '').trim();
    const processedItem = JSON.parse(aiText);

    // [4단계] 기존 데이터에 추가
    // ID 생성 (가장 큰 ID + 1)
    const allItems = [...localData.events, ...localData.benefits];
    const maxId = allItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
    processedItem.id = maxId + 1;

    if (processedItem.category === '행사') {
      localData.events.unshift(processedItem);
    } else {
      localData.benefits.unshift(processedItem);
    }

    fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`새로운 데이터 추가 완료: ${processedItem.name}`);

  } catch (err) {
    console.error('처리 중 오류 발생:', err);
  }
}

fetchData();
