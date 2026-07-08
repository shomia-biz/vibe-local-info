const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 환경변수 수동 로드
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    }
  }
}

loadEnv();
const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';
const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// HTML 태그 제거용 심플 함수
function stripHtml(html) {
  return html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

async function startManualWorkflow() {
  console.log("========================================================");
  console.log("📝 모아팁스 수동 데이터 등록 & AI 자동 분류 시스템");
  console.log("========================================================\n");

  try {
    // 1단계: URL 입력받기
    let urlInput = (await askQuestion("🔗 1. 등록할 웹페이지 주소(URL)를 복사해서 붙여넣어 주세요:\n> ")).trim();
    let webpageText = "";
    
    // 복사/붙여넣기 실수로 주소가 연속으로 두 번 붙은 경우 (예: http...http...) 자동 보정
    if (urlInput.includes('http') && urlInput.lastIndexOf('http') > 0) {
      const firstHttpIndex = urlInput.indexOf('http');
      const secondHttpIndex = urlInput.indexOf('http', firstHttpIndex + 4);
      if (secondHttpIndex > 0) {
        urlInput = urlInput.substring(0, secondHttpIndex).trim();
        console.log(`💡 주소 복사 과정에서 중복 입력이 감지되어 아래 주소로 자동 교정했습니다:\n   👉 ${urlInput}`);
      }
    }
    
    if (urlInput) {
      console.log("\n🌐 웹페이지 내용을 불러오는 중입니다...");
      try {
        const res = await fetch(urlInput, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const html = await res.text();
          webpageText = stripHtml(html).substring(0, 4000); // 4000자 제한
          console.log("✅ 웹페이지 텍스트 추출 완료!");
        } else {
          console.log(`⚠️ 웹페이지 응답 오류 (상태코드: ${res.status})`);
        }
      } catch (e) {
        console.log(`⚠️ 페이지를 직접 가져오지 못했습니다. (사유: ${e.message})`);
      }
    }

    // 웹페이지를 긁지 못했거나 URL을 입력하지 않은 경우 직접 본문 붙여넣기 유도
    if (!webpageText) {
      console.log("\n📋 아래에 상세 설명 본문(텍스트)을 복사해서 붙여넣어 주세요.");
      console.log("(입력이 끝나면 엔터를 한 번 친 후, 빈 줄에서 엔터를 한 번 더 쳐주세요)");
      
      const lines = [];
      const promptText = () => new Promise((resolve) => {
        rl.on('line', (line) => {
          if (line.trim() === '') {
            rl.removeAllListeners('line');
            resolve(lines.join('\n'));
          } else {
            lines.push(line);
          }
        });
      });
      webpageText = await promptText();
    }

    let aiData = {
      name: "",
      category: "행사",
      region: "전국",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "상시",
      location: "",
      target: "",
      summary: "",
      link: urlInput,
      serviceField: "",
      supportType: "",
      targetGroup: ""
    };

    if (webpageText.trim()) {
      console.log("\n🤖 Gemini AI를 통해 자동으로 분석 및 분류 작업을 진행하는 중...");
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      const todayStr = new Date().toISOString().split('T')[0];
      
      const prompt = `아래 수집된 텍스트와 URL 링크 정보를 분석해서 규격화된 시스템용 JSON 데이터로 정제해줘.
      형식: {name: 서비스명또는행사명, category: '행사' 또는 '문화' 또는 '전시' 또는 '혜택', region: '서울' 또는 '경기' 또는 '인천' 또는 '전국', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 대상층, summary: 내용 요약설명, link: 링크주소, serviceField: 분야(예: 문화/예술, 복지 등), supportType: 지원형태(예: 현금, 서비스 등), targetGroup: 가구유형(예: 다자녀, 청년 등)}

      [필수 규칙 가이드라인]
      1. category: 
         - 축제, 공연, 콘서트, 연주회, 스포츠 경기, 플리마켓 등 볼거리와 이벤트성 프로그램은 '행사'로 분류해.
         - 교육, 강좌, 체험 프로그램, 역사 탐방, 인문학 강의, 클래스 등 교육/체험 위주는 '문화'로 분류해.
         - 전시회, 미술전, 사진전, 박물관 기획전, 도서전 등 관람 위주는 '전시'로 분류해.
         - 지원금, 보조금, 혜택, 복지 서비스, 장학금 등은 '혜택'으로 분류해.
      2. region: 본문 내용과 주소를 보고 서울, 경기, 인천, 전국 중 알맞은 지역으로 분류해줘.
      3. startDate/endDate: 날짜 포맷은 무조건 'YYYY-MM-DD'로 처리해. 명확한 날짜가 없으면 시작일은 오늘 날짜(${todayStr}), 종료일은 '상시'로 기입해.
      4. link: 입력된 URL이 있으면 그대로 넣고, 없으면 본문에서 찾아서 넣어줘.

      불필요한 마크다운 백틱 문법이나 서론 생략하고 오로지 순수 유효 JSON 텍스트 한 덩어리만 반환해.

      텍스트: ${webpageText}
      URL: ${urlInput}`;

      try {
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const geminiResult = await geminiResponse.json();
        
        if (geminiResult.candidates && geminiResult.candidates.length > 0) {
          let aiText = geminiResult.candidates[0].content.parts[0].text;
          aiText = aiText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(aiText);
          aiData = { ...aiData, ...parsed };
          console.log("✅ AI 자동 분석이 완료되었습니다!");
        } else {
          console.log("⚠️ AI 분석 응답이 비어있어 기본 틀로 수동 입력을 진행합니다.");
        }
      } catch (err) {
        console.log(`⚠️ AI 분석 중 오류 발생: ${err.message}. 수동 입력을 진행합니다.`);
      }
    }

    // 수동 검증 전에 링크로부터 이미지 스크래핑 진행
    if (aiData.link) {
      console.log("\n🔍 원문 링크에서 대표 이미지 스크래핑 시도 중...");
      const scrapedImg = await scrapeImageFromUrl(aiData.link);
      if (scrapedImg) {
        aiData.imageUrl = scrapedImg;
        console.log(`📸 이미지 발견 완료: ${scrapedImg}`);
      } else {
        console.log("ℹ️ 원문 링크에서 이미지를 찾지 못했습니다.");
      }
    }

    // 2단계: 자동 분류 결과를 하나씩 확인하며 수정하기
    console.log("\n========================================================");
    console.log("✍️ [데이터 검증] 틀린 부분만 입력하여 수정해 주세요.");
    console.log("(그냥 엔터 누르시면 [ ] 안의 기본값이 저장됩니다)");
    console.log("========================================================\n");

    const name = (await askQuestion(`1) 명칭 [${aiData.name}]: `)).trim() || aiData.name;
    const category = (await askQuestion(`2) 분류 (행사/문화/전시/혜택) [${aiData.category}]: `)).trim() || aiData.category;
    const region = (await askQuestion(`3) 지역 (서울/경기/인천/전국) [${aiData.region}]: `)).trim() || aiData.region;
    const startDate = (await askQuestion(`4) 시작일 (YYYY-MM-DD) [${aiData.startDate}]: `)).trim() || aiData.startDate;
    const endDate = (await askQuestion(`5) 종료일 (YYYY-MM-DD 또는 상시) [${aiData.endDate}]: `)).trim() || aiData.endDate;
    const location = (await askQuestion(`6) 장소/기관명 [${aiData.location}]: `)).trim() || aiData.location;
    const target = (await askQuestion(`7) 지원/참가 대상 [${aiData.target}]: `)).trim() || aiData.target;
    const summary = (await askQuestion(`8) 내용 요약 [${aiData.summary}]: `)).trim() || aiData.summary;
    const link = (await askQuestion(`9) 홈페이지 링크 [${aiData.link}]: `)).trim() || aiData.link;
    const imageUrl = (await askQuestion(`10) 대표 이미지 URL [${aiData.imageUrl || ''}]: `)).trim() || aiData.imageUrl || "";
    const serviceField = (await askQuestion(`11) 서비스 분야 (예: 문화/예술, 복지 등) [${aiData.serviceField || ''}]: `)).trim() || aiData.serviceField || "";
    const supportType = (await askQuestion(`12) 지원 형태 (예: 현금, 서비스 등) [${aiData.supportType || ''}]: `)).trim() || aiData.supportType || "";
    const targetGroup = (await askQuestion(`13) 가구/대상 유형 (예: 다자녀, 청년 등) [${aiData.targetGroup || ''}]: `)).trim() || aiData.targetGroup || "";

    const finalItem = {
      name,
      category,
      region,
      startDate,
      endDate,
      location,
      target,
      summary,
      link,
      imageUrl,
      serviceField,
      supportType,
      targetGroup
    };

    // 3단계: 파일에 최종 저장
    const dataPath = path.join(__dirname, '../public/data/local-info.json');
    if (!fs.existsSync(dataPath)) {
      console.error("❌ local-info.json 파일을 찾을 수 없습니다.");
      rl.close();
      return;
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const localData = JSON.parse(fileContent);

    // 날짜 포맷 간단한 유효성 체크
    if (!/^\d{4}-\d{2}-\d{2}$/.test(finalItem.startDate) && finalItem.startDate !== '상시') {
      console.error("❌ startDate 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다.");
      rl.close();
      return;
    }

    // 중복 체크
    const isDuplicate = (localData.events && localData.events.some(e => e.name === finalItem.name)) || 
                       (localData.benefits && localData.benefits.some(b => b.name === finalItem.name)) ||
                       (localData.cultureEvents && localData.cultureEvents.some(c => c.name === finalItem.name)) ||
                       (localData.exhibitionEvents && localData.exhibitionEvents.some(ex => ex.name === finalItem.name));
    if (isDuplicate) {
      console.warn(`⚠️ 이미 [${finalItem.name}] 데이터가 보관함에 등록되어 있습니다.`);
      rl.close();
      return;
    }

    // ID 발급
    const allItems = [
      ...(localData.events || []), ...(localData.benefits || []),
      ...(localData.cultureEvents || []), ...(localData.exhibitionEvents || []),
      ...(localData.seoulEvents || []), ...(localData.kyeonggiEvents || []), ...(localData.incheonEvents || []), ...(localData.nationalEvents || []),
      ...(localData.seoulBenefits || []), ...(localData.kyeonggiBenefits || []), ...(localData.incheonBenefits || []), ...(localData.nationalBenefits || []),
      ...(localData.seoulCultureEvents || []), ...(localData.kyeonggiCultureEvents || []), ...(localData.incheonCultureEvents || []), ...(localData.nationalCultureEvents || []),
      ...(localData.seoulExhibitionEvents || []), ...(localData.kyeonggiExhibitionEvents || []), ...(localData.incheonExhibitionEvents || []), ...(localData.nationalExhibitionEvents || [])
    ];
    const maxId = allItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
    finalItem.id = maxId + 1;
    finalItem.updatedAt = new Date().toISOString().split('T')[0];

    // 분류에 맞추어 밀어 넣기
    if (finalItem.category === '행사') {
      switch (finalItem.region) {
        case '서울': 
          if (!localData.seoulEvents) localData.seoulEvents = [];
          localData.seoulEvents.unshift(finalItem); 
          break;
        case '경기': 
          if (!localData.kyeonggiEvents) localData.kyeonggiEvents = [];
          localData.kyeonggiEvents.unshift(finalItem); 
          break;
        case '인천': 
          if (!localData.incheonEvents) localData.incheonEvents = [];
          localData.incheonEvents.unshift(finalItem); 
          break;
        default: 
          if (!localData.nationalEvents) localData.nationalEvents = [];
          localData.nationalEvents.unshift(finalItem); 
          break;
      }
    } else if (finalItem.category === '문화') {
      switch (finalItem.region) {
        case '서울': 
          if (!localData.seoulCultureEvents) localData.seoulCultureEvents = [];
          localData.seoulCultureEvents.unshift(finalItem); 
          break;
        case '경기': 
          if (!localData.kyeonggiCultureEvents) localData.kyeonggiCultureEvents = [];
          localData.kyeonggiCultureEvents.unshift(finalItem); 
          break;
        case '인천': 
          if (!localData.incheonCultureEvents) localData.incheonCultureEvents = [];
          localData.incheonCultureEvents.unshift(finalItem); 
          break;
        default: 
          if (!localData.nationalCultureEvents) localData.nationalCultureEvents = [];
          localData.nationalCultureEvents.unshift(finalItem); 
          break;
      }
    } else if (finalItem.category === '전시') {
      switch (finalItem.region) {
        case '서울': 
          if (!localData.seoulExhibitionEvents) localData.seoulExhibitionEvents = [];
          localData.seoulExhibitionEvents.unshift(finalItem); 
          break;
        case '경기': 
          if (!localData.kyeonggiExhibitionEvents) localData.kyeonggiExhibitionEvents = [];
          localData.kyeonggiExhibitionEvents.unshift(finalItem); 
          break;
        case '인천': 
          if (!localData.incheonExhibitionEvents) localData.incheonExhibitionEvents = [];
          localData.incheonExhibitionEvents.unshift(finalItem); 
          break;
        default: 
          if (!localData.nationalExhibitionEvents) localData.nationalExhibitionEvents = [];
          localData.nationalExhibitionEvents.unshift(finalItem); 
          break;
      }
    } else if (finalItem.category === '혜택') {
      switch (finalItem.region) {
        case '서울': 
          if (!localData.seoulBenefits) localData.seoulBenefits = [];
          localData.seoulBenefits.unshift(finalItem); 
          break;
        case '경기': 
          if (!localData.kyeonggiBenefits) localData.kyeonggiBenefits = [];
          localData.kyeonggiBenefits.unshift(finalItem); 
          break;
        case '인천': 
          if (!localData.incheonBenefits) localData.incheonBenefits = [];
          localData.incheonBenefits.unshift(finalItem); 
          break;
        default: 
          if (!localData.nationalBenefits) localData.nationalBenefits = [];
          localData.nationalBenefits.unshift(finalItem); 
          break;
      }
    }

    fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`\n🎉 최종 데이터 등록 완료!`);
    console.log(`🏷️  분류: [${finalItem.category} / ${finalItem.region}]`);
    console.log(`📌 명칭: ${finalItem.name}`);
    console.log(`💾 local-info.json 파일에 정상적으로 저장되었습니다.`);

  } catch (err) {
    console.error("❌ 작업 중 오류 발생:", err.message);
  } finally {
    rl.close();
  }
}

startManualWorkflow();
