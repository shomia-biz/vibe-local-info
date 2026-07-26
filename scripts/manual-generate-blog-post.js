const fs = require('fs');
const path = require('path');
const readline = require('readline');
const utils = require('./fetch-utils');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function generateManualPost() {
  loadEnv();

  const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';
  const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.error('환경변수(GEMINI_API_KEY)가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.');
    rl.close();
    return;
  }

  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  try {
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // 서울, 경기, 인천, 전국 등 새롭게 분류된 모든 데이터를 하나로 합칩니다.
    const allItems = [
      ...localData.events, ...localData.benefits,
      ...localData.cultureEvents, ...localData.exhibitionEvents,
      ...localData.seoulEvents, ...localData.kyeonggiEvents, ...localData.incheonEvents, ...localData.nationalEvents,
      ...localData.seoulCultureEvents, ...localData.kyeonggiCultureEvents, ...localData.incheonCultureEvents, ...localData.nationalCultureEvents,
      ...localData.seoulExhibitionEvents, ...localData.kyeonggiExhibitionEvents, ...localData.incheonExhibitionEvents, ...localData.nationalExhibitionEvents,
      ...localData.seoulBenefits, ...localData.kyeonggiBenefits, ...localData.incheonBenefits, ...localData.nationalBenefits
    ];
    
    if (allItems.length === 0) {
      console.log('데이터가 없습니다.');
      rl.close();
      return;
    }

    console.log("========================================================");
    console.log("📝 수동 블로그 포스팅 생성기");
    console.log("========================================================");

    const searchTerm = await askQuestion("검색할 행사/혜택의 이름 일부나 고유 ID를 입력하세요:\n> ");
    if (!searchTerm.trim()) {
      console.log('입력이 취소되었습니다.');
      rl.close();
      return;
    }

    // 검색어로 필터링
    const matchedItems = allItems.filter(item => {
      const nameMatch = item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = item.id && item.id.toString() === searchTerm.trim();
      return nameMatch || idMatch;
    });

    if (matchedItems.length === 0) {
      console.log(`❌ "${searchTerm}"에 해당하는 데이터를 찾을 수 없습니다.`);
      rl.close();
      return;
    }

    let targetItem = matchedItems[0];
    
    if (matchedItems.length > 1) {
      console.log(`\n🔍 총 ${matchedItems.length}개의 데이터가 검색되었습니다. 어떤 글로 포스팅할까요?`);
      matchedItems.forEach((item, index) => {
        console.log(`[${index + 1}] ${item.name} (ID: ${item.id})`);
      });
      
      let choiceValid = false;
      while (!choiceValid) {
        const choice = await askQuestion(`\n번호를 선택하세요 (1~${matchedItems.length}): `);
        const num = parseInt(choice, 10);
        if (num >= 1 && num <= matchedItems.length) {
          targetItem = matchedItems[num - 1];
          choiceValid = true;
        } else {
          console.log("⚠️ 올바른 번호를 입력해주세요.");
        }
      }
    }

    console.log(`\n🤖 [${targetItem.name}] 정보로 수동 블로그 글 생성을 시작합니다...`);

    const today = new Date().toISOString().split('T')[0];

    const prompt = `아래 공공서비스 정보를 바탕으로 구글 애드센스 승인과 검색엔진(SEO) 상위 노출에 최적화된 고품질 블로그 글을 작성해줘.
단순히 정보를 나열하는 것을 넘어, 독자에게 실질적인 가치를 제공하는 전문가적 시선과 풍부한 해설을 포함해야 해.

정보: ${JSON.stringify(targetItem)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 검색량이 많을 법한 매력적인 제목)
date: ${today}
summary: (독자의 호기심을 자극하는 한 줄 요약)
category: 정보
tags: [태그1, 태그2, tags3]
---

[요약 정보 표]
- 본문 시작 바로 직후(--- 블록 하단)에 아래 형식의 마크다운 표(Table)로 핵심 내용을 1줄 요약해서 요약 정보 스니펫을 만들어줘:
| 항목 | 내용 |
| --- | --- |
| **신청 대상** | (해당하는 조건/대상 요약) |
| **지원 금액 (또는 혜택)** | (지원 금액이나 혜택 요약, 행사의 경우 무료/유료 여부 등) |
| **신청 기간 (또는 행사 기간)** | (신청 기간 또는 행사 날짜 요약) |
| **신청 방법 (또는 장소)** | (신청 방법 및 장소 요약) |

[본문 작성 가이드]
1. 분량: 최소 2,000자 이상(공백 제외)으로 아주 상세하고 풍부하게 작성해줘. (구글 애드센스 승인을 위해 필수)
2. 톤앤매너: 친근하면서도 신뢰감을 주는 전문가의 블로그 톤으로 작성해. 독자에게 직접 말을 건네는 듯한 자연스러운 문장을 써줘.
3. 소제목 활용: 본문 내의 모든 소제목은 반드시 '## 소제목' (h2) 또는 '### 소제목' (h3)만 사용해줘. 단 하나의 '#' (h1)은 절대 사용하면 안 돼!
4. 내용 구성 필수 요소:
   - 도입부: 이 혜택/행사가 왜 지금 필요한지, 어떤 사람들의 고민을 해결해 줄 수 있는지 독자의 공감을 이끌어내는 스토리텔링으로 시작해줘.
   - 상세 설명 및 꿀팁: 신청 자격, 혜택 내용 등을 기계적으로 요약하지 말고, "이런 분들에게 특히 유리합니다", "놓치기 쉬운 팁" 등 본인만의 독창적인 해설과 의견(Opinion)을 덧붙여줘.
   - 구체적 사례(Case Study): 가상의 인물이나 상황을 예로 들어 이 혜택을 받았을 때 얼마나 좋아지는지 실생활 예시를 반드시 1개 이상 포함해줘.
   - 자주 묻는 질문 (FAQ): 독자들이 궁금해할 만한 핵심 질문과 답변 3가지를 '### 자주 묻는 질문 (FAQ)' 섹션으로 작성해줘.
   - 추천 이유 3가지: 본문 소제목(##)과 함께 자세히 작성해줘. (예: **첫째, ...** 작성 후 줄바꿈)
   - 신청/참여 방법: 어떻게 신청하는지 구체적으로 안내하고, 따뜻한 응원의 마무리 인사를 적어줘.
5. 이미지 태그: 혹시 본문 내에 이미지가 포함되는 마크다운을 작성할 일이 있다면, 반드시 대체 텍스트(alt)에 '![[지원금/행사 이름] 안내 이미지](이미지주소)' 형식이 들어가도록 해줘.
6. [중요: AI 티 제거 (Humanizer 규칙 적용)]: 
   - 번역투("~에 대해", "~를 통해", "~할 수 있다", "~의해")나 수동태를 절대 사용하지 말고, 자연스러운 능동태 한국어로 써줘.
   - "결론적으로", "따라서", "혁명적", "파격적", "압도적" 등 기계적이거나 과장된 표현을 빼고 담백하게 써줘.
   - "~일 것이다", "~인 것이다" 등 애매한 추측성 말투 대신 확신에 찬 어조로 단언해줘.
   - 문장 길이를 다양하게 섞고, "~다"로 끝나는 문장이 3번 이상 연속되지 않게 리듬감 있게 작성해줘.
   - 내용 전체가 100% 사람이 직접 겪고 분석한 것처럼 사람 냄새가 나도록 철저히 윤문해줘.

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    let fullContent = '';
    try {
      const result = await utils.fetchGeminiWithFallback(prompt, GEMINI_API_KEY, 'blog');
      fullContent = result.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error(`❌ 글 생성에 실패했습니다. (원인: ${err.message})`);
      rl.close();
      return;
    }

    const filenameMatch = fullContent.match(/FILENAME:\s*(.+)/);
    let filename = `${today}-${targetItem.id || 'post'}.md`;
    let blogContent = fullContent;

    if (filenameMatch) {
      filename = filenameMatch[1].trim();
      if (!filename.endsWith('.md')) filename += '.md';
      blogContent = fullContent.replace(/FILENAME:\s*.+/, '').trim();
    }

    blogContent = blogContent.replace(/```markdown|```/g, '').trim();

    if (blogContent.startsWith('---')) {
      const parts = blogContent.split('---');
      if (parts.length >= 3) {
        let frontMatter = parts[1];
        const lines = frontMatter.split('\n');
        const updatedLines = lines.map(line => {
          if (line.startsWith('title:') || line.startsWith('summary:')) {
            const colonIndex = line.indexOf(':');
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            if (!((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
              value = value.replace(/"/g, '\\"');
              return `${key}: "${value}"`;
            }
          }
          return line;
        });
        parts[1] = updatedLines.join('\n');
        blogContent = parts.join('---');
      }
    }

    const finalPath = path.join(postsDir, filename);
    fs.writeFileSync(finalPath, blogContent, 'utf8');

    // [자동화] 사이트맵(sitemap.xml) 업데이트 로직
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      try {
        let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        const slug = filename.replace('.md', '');
        const newUrlEntry = `  <url>\n    <loc>https://moa-tips.com/blog/${slug}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
        
        if (!sitemapContent.includes(`<loc>https://moa-tips.com/blog/${slug}/</loc>`)) {
          sitemapContent = sitemapContent.replace('</urlset>', `${newUrlEntry}</urlset>`);
          fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
          console.log(`   🗺️ 사이트맵(sitemap.xml) 업데이트 완료`);
        }
      } catch (sitemapErr) {
        console.error(`   ⚠️ 사이트맵 업데이트 중 에러:`, sitemapErr.message);
      }
    }

    // [기록] 히스토리에 수동 생성 항목도 추가
    const historyPath = path.join(process.cwd(), 'public/data/posted_history.txt');
    const recordText = targetItem.id ? `${targetItem.id}|${targetItem.name}` : targetItem.name;
    fs.appendFileSync(historyPath, recordText + '\n', 'utf8');
    
    console.log(`\n🎉 수동 블로그 글 생성이 완료되었습니다: ${filename}\n`);

  } catch (err) {
    console.error('에러 발생:', err);
  } finally {
    rl.close();
  }
}

generateManualPost();
