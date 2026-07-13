const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser();
const { execSync } = require('child_process');

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

const HISTORY_FILE = path.join(__dirname, 'generated-history.json');

async function callGemini(prompt, isJson = false) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    })
  });
  const result = await response.json();
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

async function getTrendingKeywords() {
  try {
    const feed = await parser.parseURL('https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko');
    // 구글 뉴스의 경우 "제목 - 언론사" 형태이므로 " - 언론사" 부분을 잘라내고 키워드로 활용합니다.
    return feed.items.map(item => item.title.split(' - ')[0].trim());
  } catch (err) {
    console.error("트렌드 가져오기 실패:", err);
    return [];
  }
}

async function runAutoGuide() {
  console.log("========================================================");
  console.log("🚀 모아팁스 AI 핫이슈 자동 생성기 시작");
  console.log("========================================================\n");

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY가 설정되어 있지 않습니다.");
    return;
  }

  // 히스토리 로드
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }

  console.log("🔍 구글 실시간 트렌드 키워드 수집 중...");
  const trends = await getTrendingKeywords();
  if (trends.length === 0) {
    console.error("⚠️ 트렌드 키워드를 가져올 수 없습니다.");
    return;
  }

  // 중복 필터링
  const newKeywords = trends.filter(keyword => !history.includes(keyword));
  console.log(`✅ 수집된 트렌드 ${trends.length}개 중 새로운 키워드 ${newKeywords.length}개 발견`);

  if (newKeywords.length === 0) {
    console.log("오늘은 더 이상 생성할 새로운 핫이슈가 없습니다.");
    return;
  }

  // 상위 3개 선택
  const targetKeywords = newKeywords.slice(0, 3);
  console.log(`선정된 키워드: ${targetKeywords.join(', ')}\n`);

  for (const keyword of targetKeywords) {
    console.log(`\n-------------------------------------`);
    console.log(`🎯 [${keyword}] 포스팅 생성 시작...`);

    // 1. 제목 생성
    const titlePrompt = `당신은 트래픽을 끌어모으는 천재적인 웹 콘텐츠 에디터입니다.
다음 주제에 대해, 구글 검색이나 SNS에서 사람들이 무조건 클릭하고 싶어지는 자극적이고 구체적인 제목 1개를 제안해주세요. 
앞뒤에 따옴표나 기타 설명 없이 오직 '제목'만 반환하세요.
주제: ${keyword}`;

    let finalTitle = "";
    try {
      finalTitle = await callGemini(titlePrompt, false);
      finalTitle = finalTitle.replace(/["']/g, ''); // 따옴표 제거
    } catch (e) {
      console.log(`⚠️ 제목 생성 실패: ${e.message}, 기본 제목 사용`);
      finalTitle = `[핫이슈] ${keyword} 총정리`;
    }

    console.log(`📝 생성된 제목: ${finalTitle}`);

    // 2. 본문 생성
    const today = new Date().toISOString().split('T')[0];
    const prompt = `당신은 웹사이트의 전문 에디터입니다. 아래 확정된 제목으로, 아주 상세하고 정보가 풍부한 블로그 포스트를 마크다운(Markdown) 형식으로 작성해주세요.

[확정된 제목]: ${finalTitle}

[작성 규칙 및 필수 포맷]
1. 프론트매터(Frontmatter)를 맨 위에 반드시 포함하세요.
   - title: "${finalTitle}"
   - summary: 1~2줄 분량의 호기심을 유발하는 요약
   - date: "${today}"
   - category: 핫이슈
   - thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
   - cta_link: "https://moa-tips.com"

2. 본문 구조
   - "## 1. [소제목]" 형태로 대주제를 3~4개 나누어 논리적으로 작성하세요.
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
      
      const slugPrompt = `다음 한국어 제목을 URL에 사용할 수 있는 영어 슬러그(소문자, 알파벳, 숫자, 하이픈(-)만 포함)로 번역/변환해줘. 공백은 하이픈으로. 단어만 반환.\n제목: ${finalTitle}`;
      let slug = `hot-issue-${Date.now()}`;
      try {
        const slugText = await callGemini(slugPrompt, false);
        slug = slugText.toLowerCase().replace(/[^a-z0-9-]/g, '');
      } catch(e) {}

      const filePath = path.join(__dirname, `../src/content/guide/${slug}.md`);
      fs.writeFileSync(filePath, markdownContent, 'utf8');
      
      console.log(`🎉 성공! [${slug}.md] 저장 완료`);
      
      // 기록 업데이트
      history.push(keyword);
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');

    } catch (e) {
      console.error(`❌ [${keyword}] 포스팅 생성 실패:`, e.message);
    }
  }

  // Sitemap update
  try {
    console.log(`\n🔄 검색엔진 노출을 위해 sitemap.xml을 자동 업데이트 합니다...`);
    execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
  } catch (e) {
    console.error(`⚠️ sitemap 업데이트 중 오류가 발생했습니다:`, e.message);
  }

  console.log("\n========================================================");
  console.log("✨ 핫이슈 자동 생성기 작업 완료!");
  console.log("========================================================");
}

runAutoGuide();
