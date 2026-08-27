
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
  const titlePrompt = `당신은 트래픽을 끌어모으는 천재적인 웹 콘텐츠 에디터입니다. 현재 연도는 ${new Date().getFullYear()}년 입니다. 제목에 연도가 들어간다면 반드시 현재 연도를 사용하세요.
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

  const templates = [
    "【유형 A: 경험담/썰 풀기】\n- 블로그 주인이 직접 겪은 일이나 주변 지인의 생생한 에피소드로 서론을 시작하세요.\n- 딱딱한 정보 나열보다는 '내가 직접 알아본 결과'라는 느낌을 강하게 줍니다.\n- 본문 소제목은 자유롭게 구성하되, 중간에 인용구(>)를 사용하여 감정이나 느낀 점을 강조하세요.",
    "【유형 B: 전문가 분석 칼럼】\n- 해당 분야의 전문가(에디터)가 핵심적인 팁을 분석해 주는 톤으로 작성하세요.\n- 서론에 '이 글을 끝까지 읽으면 얻을 수 있는 확실한 이득'을 단호하게 제시하세요.\n- 글 마지막에 '에디터의 한마디' 또는 '전문가의 팁' 섹션을 별도로 추가하여 깊이 있는 인사이트를 제공하세요.",
    "【유형 C: 친근한 리뷰/가이드】\n- 마치 친한 친구나 동네 이웃에게 꿀팁을 알려주듯이 친근하고 부드러운 말투로 작성하세요.\n- 글 중간중간 공감할 만한 일상적인 상황을 예시로 들어 설명하세요.\n- 장점과 단점, 또는 주의할 점을 표(Table)로 명확하게 비교해 주는 섹션을 반드시 포함하세요."
  ];
  
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

  const prompt = `당신은 구글 애드센스 심사를 통과하기 위해 고품질의 독창적인(E-E-A-T) 글을 작성하는 전문 에디터입니다. 아래 확정된 제목으로, 아주 상세하고 정보가 풍부한 블로그 포스트를 마크다운(Markdown) 형식으로 작성해주세요. 현재 기준 날짜는 ${today} 입니다. 본문이나 제목에서 연도나 날짜를 언급할 때 반드시 이를 기준으로 작성하세요.

[확정된 제목]: ${finalTitle}

[작성 규칙 및 필수 포맷]
1. 프론트매터(Frontmatter)를 맨 위에 반드시 포함하세요.
   - title: "${finalTitle}"
   - summary: 1~2줄 분량의 호기심을 유발하는 요약
   - date: "${today}"
   - category: 주제에 맞는 카테고리
   - tags: [키워드1, 키워드2, 키워드3] 
   - thumbnail: "https://image.pollinations.ai/prompt/[영어로 번역된 핵심 키워드]?width=800&height=400&nologo=true"
   - cta_link: "https://moa-tips.com"

2. 구조 및 템플릿 (이번 글은 반드시 아래의 템플릿 유형을 따르세요)
   \${randomTemplate}
   - 본문이 시작되는 맨 윗부분에 **마크다운 목차(Table of Contents)**를 추가하세요 (선택 사항이나 권장함).
   - 본문에 프론트매터의 thumbnail과 동일한 URL을 사용하여 대표 이미지를 최소 1개 이상 삽입하세요.
   - 글의 가독성을 위해 적절히 이미지를 추가하되, 억지로 많이 넣지 말고 꼭 필요한 곳에 1~2개만 추가하세요.

3. E-E-A-T (경험, 전문성, 권위, 신뢰) 및 가치 부여 - **가장 중요**
   - 구글의 '가치가 별로 없는 콘텐츠' 제재를 피하기 위해, 단순한 사실 나열이나 백과사전식 설명은 절대 피하세요.
   - 글의 서론이나 본문 중간에 가상의 에디터(나)가 겪은 구체적인 사례, 실수담, 또는 일상적인 에피소드를 최소 2문단 이상 포함하세요.
   - 독자가 이 글을 읽고 즉시 행동에 옮길 수 있는 나만의 '실전 꿀팁'을 반드시 포함하세요.

4. 마무리 및 FAQ
   - 글의 마지막에 "## 마무리하며" 섹션으로 내용을 정리하세요.
   - 필요하다면 HTML 아코디언(<details>)을 활용하여 FAQ를 작성해도 좋습니다. (강제 아님)

5. AI 티 제거 (Humanizer 규칙 적용)
   - 번역투("~에 대해", "~를 통해")나 수동태를 절대 사용하지 말고, 자연스러운 능동태 한국어로 쓰세요.
   - "결론적으로", "파격적" 등 기계적이거나 과장된 표현을 빼고 담백하고 사람 냄새 나게 쓰세요.
   - 내용 전체가 100% 사람이 직접 겪고 분석한 것처럼 철저히 윤문하세요.

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
