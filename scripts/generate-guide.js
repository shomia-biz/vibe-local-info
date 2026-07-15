
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const utils = require('./fetch-utils');

// 환경변수 수동 로드 (.env.local)
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

async function callGemini(prompt, isJson = false) {
  const result = await utils.fetchGeminiWithFallback(prompt, GEMINI_API_KEY, 'blog');

  if (result.candidates && result.candidates.length > 0) {
    let text = result.candidates[0].content?.parts[0]?.text;
    if (text) {
      text = text.trim();
      if (isJson) {
        text = text.replace(/```json\n?/m, '').replace(/```\n?/m, '').trim();
        return JSON.parse(text);
      }
      return text;
    }
  }
  
  console.error("❌ AI API 상세 응답 내역:", JSON.stringify(result, null, 2));
  throw new Error("AI 응답이 비어있습니다. (안전 필터링에 걸렸거나 응답 생성 실패)");
}

async function generateGuide() {
  console.log("========================================================");
  console.log("🚀 모아팁스 AI 가이드 자동 생성기 (유용한 정보 Hub)");
  console.log("========================================================\n");

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY가 설정되어 있지 않습니다.");
    rl.close();
    return;
  }

  // 1단계: 러프한 주제 입력
  const rawTopic = (await askQuestion("✨ 생각하시는 대략적인 주제나 키워드를 입력하세요 (예: 3기 신도시 청약):\n> ")).trim();

  if (!rawTopic) {
    console.log("⚠️ 주제가 입력되지 않았습니다. 취소합니다.");
    rl.close();
    return;
  }

  // 2단계: AI가 매력적인 제목 5개 추천
  console.log("\n🤖 클릭을 유도하는 매력적인 제목 후보를 뽑아내고 있습니다. 잠시만 대기해주세요...");
  const titlePrompt = `당신은 트래픽을 끌어모으는 천재적인 웹 콘텐츠 에디터입니다.
다음 주제에 대해, 구글 검색이나 SNS에서 사람들이 무조건 클릭하고 싶어지는 자극적이고 구체적인 제목 5개를 제안해주세요. 
번호를 매기지 말고, 순수하게 JSON 배열 형태로만 반환해주세요. (예: ["제목1", "제목2", ...])
주제: ${rawTopic}`;

  let suggestedTitles = [];
  try {
    suggestedTitles = await callGemini(titlePrompt, true);
  } catch (e) {
    console.log("⚠️ 제목 생성 중 오류 발생:", e.message);
    suggestedTitles = [`[기본] ${rawTopic} 완벽 가이드`, `${rawTopic} 총정리`]; // 폴백
  }

  console.log("\n🎯 다음 중 마음에 드는 제목을 선택하세요:");
  suggestedTitles.forEach((title, idx) => {
    console.log(`  [${idx + 1}] ${title}`);
  });
  console.log(`  [0] 직접 다른 제목 입력하기`);

  let finalTitle = "";
  let choiceValid = false;

  while (!choiceValid) {
    const choice = (await askQuestion("\n번호를 입력하세요 (0~5): ")).trim();
    const num = parseInt(choice, 10);
    
    if (num === 0) {
      finalTitle = (await askQuestion("직접 사용할 제목을 입력하세요: ")).trim();
      if (finalTitle) choiceValid = true;
    } else if (num >= 1 && num <= suggestedTitles.length) {
      finalTitle = suggestedTitles[num - 1];
      choiceValid = true;
    } else {
      console.log("⚠️ 올바른 번호를 입력해주세요.");
    }
  }

  // 3단계: 최종 제목을 바탕으로 전체 콘텐츠 생성
  console.log(`\n🤖 [${finalTitle}] (으)로 확정되었습니다!`);
  console.log(`해당 제목에 맞춰 고품질 마크다운 콘텐츠를 작성 중입니다. (약 10~20초 소요)...`);

  const today = new Date().toISOString().split('T')[0];

  const prompt = `당신은 웹사이트의 전문 에디터입니다. 아래 확정된 제목으로, 아주 상세하고 정보가 풍부한 블로그 포스트를 마크다운(Markdown) 형식으로 작성해주세요.

[확정된 제목]: ${finalTitle}

[작성 규칙 및 필수 포맷]
1. 프론트매터(Frontmatter)를 맨 위에 반드시 포함하세요.
   - title: "${finalTitle}"
   - summary: 1~2줄 분량의 호기심을 유발하는 요약
   - date: "${today}"
   - category: 주제에 맞는 카테고리 (예: 생활, 경제, IT, 부동산 등)
   - thumbnail: "https://image.pollinations.ai/prompt/[영어로 번역된 핵심 키워드]?width=800&height=400&nologo=true" (예: 제목이 '부동산 청약'이라면 "https://image.pollinations.ai/prompt/real%20estate%20subscription?width=800&height=400&nologo=true" 처럼 URL 인코딩된 영어 키워드를 넣으세요)
   - cta_link: "https://moa-tips.com"

2. 본문 구조
   - 본문이 시작되는 맨 윗부분에 **마크다운 목차(Table of Contents)**를 반드시 추가하세요. (목차 제목은 "## 이 글의 목차" 로 작성하세요)
   - 목차에 "1. 1. 소제목"처럼 숫자가 중복되지 않도록, 숫자(1., 2.) 대신 글머리 기호(-)를 사용하세요. (예: - [1. 소제목](#1-소제목))
   - 목차가 끝난 직후, 바로 밑에 프론트매터의 thumbnail과 동일한 URL을 사용하여 썸네일 이미지( ![대표 이미지](https://image.pollinations.ai/prompt/[영어로 번역된 핵심 키워드]?width=800&height=400&nologo=true) )를 반드시 삽입하세요.
   - 본문의 소제목은 "## 1. [소제목]" 형태로 3~4개 나누어 작성하며, 목차의 링크와 소제목이 정확히 연결되게 앵커를 설정하세요.
   - 본문 중간에 가독성을 높이기 위해 반드시 마크다운 표(Table)를 1개 이상 포함하여 핵심 데이터를 깔끔하게 정리하세요.
   - 중요한 정보는 굵은 글씨(**텍스트**)나 리스트(Bullet points)를 적극 활용하세요.

3. FAQ 섹션
   - "## 자주 묻는 질문 (FAQ)" 섹션을 만들고, 반드시 아래와 같이 HTML 아코디언(<details>, <summary>) 형식으로 작성하세요. 마크다운 문법 대신 순수 HTML 태그를 사용해야 합니다.
   <details>
     <summary>Q. 첫 번째 질문 내용</summary>
     <div class="faq-content">A. 첫 번째 답변 내용</div>
   </details>

4. 마무리
   - "## 마무리하며" 섹션으로 글을 맺어주세요.

응답은 마크다운 코드 블록(\`\`\`markdown ... \`\`\`) 없이, 순수한 프론트매터와 마크다운 텍스트 원문만 반환해주세요.`;

  try {
    let markdownContent = await callGemini(prompt, false);
    markdownContent = markdownContent.replace(/^```markdown\n?/m, '').replace(/^```\n?/m, '').trim();
    
    // 영어 슬러그(파일명) 생성
    const slugPrompt = `다음 한국어 제목을 URL에 사용할 수 있는 영어 슬러그(소문자, 알파벳, 숫자, 하이픈(-)만 포함)로 번역/변환해줘. 공백은 하이픈으로. 단어만 반환.\n제목: ${finalTitle}`;
    let slug = `new-guide-${Date.now()}`;
    try {
      const slugText = await callGemini(slugPrompt, false);
      slug = slugText.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    } catch(e) {}

    const fileName = `${today}-${slug}.md`;
    const filePath = path.join(__dirname, `../src/content/guide/${fileName}`);
    fs.writeFileSync(filePath, markdownContent, 'utf8');
    
    // 히스토리 자동 저장 기능 추가
    const historyPath = path.join(__dirname, '../public/data/generated-history.json');
    let history = [];
    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      } catch(e) {}
    }
    if (!history.includes(finalTitle)) {
      history.push(finalTitle);
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    }

    console.log(`\n🎉 성공! AI가 작성한 포스트가 저장되었습니다.`);
    console.log(`📂 저장 위치: src/content/guide/${fileName}`);

    // 생성 직후 자동으로 사이트맵(Sitemap) 업데이트 실행
    try {
      console.log(`\n🔄 검색엔진 노출을 위해 sitemap.xml을 자동 업데이트 합니다...`);
      const { execSync } = require('child_process');
      execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
    } catch (sitemapErr) {
      console.log(`⚠️ sitemap 업데이트 중 오류가 발생했습니다:`, sitemapErr.message);
    }

  } catch (error) {
    console.error("❌ 오류가 발생했습니다:", error.message);
  } finally {
    rl.close();
  }
}

generateGuide();
