const fs = require('fs');
const path = require('path');
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

async function generatePost() {
  loadEnv();

  const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';
  const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.error('환경변수(GEMINI_API_KEY)가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.');
    return;
  }

  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  try {
    // [1단계] 최신 데이터 확인
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // 서울, 경기, 인천, 전국 등 새롭게 분류된 모든 데이터를 하나로 합쳐서 블로그 글 후보로 만듭니다.
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
      return;
    }

    // 기존 포스트 파일들 읽기 (과거 방식 호환용)
    const existingFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const existingContents = existingFiles.map(file => fs.readFileSync(path.join(postsDir, file), 'utf8'));

    // [중복 방지 원칙 적용] 히스토리 DB (기록장) 대조
    const historyPath = path.join(process.cwd(), 'public/data/posted_history.txt');
    let postedHistory = '';
    if (fs.existsSync(historyPath)) {
      postedHistory = fs.readFileSync(historyPath, 'utf8');
    }

    // 1회 실행 당 최대 생성할 블로그 글 수 (필요시 숫자를 변경하시면 됩니다)
    const MAX_POSTS_TO_GENERATE =1;
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜

    // 아직 글을 작성하지 않은 '최신' 항목 찾기 (최대 MAX_POSTS_TO_GENERATE개 수집)
    const targetItems = [];
    for (const item of allItems) {
      // B 방법: 원본 출처(링크)가 없으면 블로그 작성 대상에서 아예 제외
      if (!item.link || item.link.trim() === '') {
        continue;
      }
      
      // 이미 종료된 행사나 혜택은 작성 후보에서 제외 ("상시" 제외)
      if (item.endDate && item.endDate !== '상시') {
        if (utils.isDatePassed(item.endDate) || item.endDate < today) {
          continue;
        }
      }
      if (targetItems.length >= MAX_POSTS_TO_GENERATE) {
        break;
      }

      // 제목이나 본문에 해당 데이터의 이름 또는 고유 ID가 포함되어 있는지 확인
      const alreadyPostedInFiles = existingContents.some(content => 
        (item.id && content.includes(item.id)) || 
        content.includes(item.name) || 
        (content.includes('title:') && content.includes(item.name))
      );

      // [중복 방지 원칙 적용] 기록장에 고유 ID나 이름이 이미 있으면 (Pass)
      const alreadyInHistory = (item.id && postedHistory.includes(item.id)) || postedHistory.includes(item.name);

      if (!alreadyPostedInFiles && !alreadyInHistory) {
        targetItems.push(item);
      }
    }

    if (targetItems.length === 0) {
      console.log('모든 최신 데이터에 대해 이미 블로그 글이 작성되었습니다. 새 글 생성을 건너뜁니다.');
      return;
    }

    console.log(`\n📝 블로그 글이 없는 신규 데이터 ${targetItems.length}개를 발견했습니다. 순차적으로 생성을 시작합니다.\n`);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // [2단계] 루프를 돌며 각 아이템에 대한 블로그 글 생성
    for (let i = 0; i < targetItems.length; i++) {
      const latestItem = targetItems[i];
      console.log(`🤖 [${i + 1}/${targetItems.length}] "${latestItem.name}" 정보로 블로그 글 생성 중...`);

      // 평소에는 4초만 대기하여 실행 속도를 극대화합니다.
      if (i > 0) {
        console.log(`⏳ 안정적인 생성을 위해 4초간 대기합니다...`);
        await sleep(4000);
      }

      const templates = [
        "【유형 A: 경험담/썰 풀기】\\n- 블로그 주인이 이 혜택/행사를 직접 알아본 것처럼 생생한 일상 에피소드로 서론을 시작하세요.\\n- 딱딱한 정보 나열보다는 '내가 직접 혜택을 챙긴다'는 느낌을 강하게 줍니다.\\n- 본문 소제목은 자유롭게 구성하되, 중간에 인용구(>)를 사용하여 느낀 점이나 당부의 말을 강조하세요.",
        "【유형 B: 전문가 분석 칼럼】\\n- 복지/행사 분야의 전문가(에디터)가 핵심적인 팁을 족집게처럼 집어주는 톤으로 작성하세요.\\n- 서론에 '이 글을 끝까지 읽으면 놓치지 않을 확실한 이득'을 단호하게 제시하세요.\\n- 글 마지막에 '에디터의 한마디' 또는 '전문가의 팁' 섹션을 별도로 추가하여 깊이 있는 인사이트를 제공하세요.",
        "【유형 C: 친근한 리뷰/가이드】\\n- 마치 친한 친구나 동네 이웃에게 꿀정보를 알려주듯이 친근하고 부드러운 말투로 작성하세요.\\n- 글 중간중간 공감할 만한 일상적인 고민(예: 돈 걱정, 주말 나들이 고민 등)을 예시로 들어 설명하세요."
      ];
      
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

      const prompt = `아래 공공서비스 정보를 바탕으로 구글 애드센스 승인을 통과하기 위한 고품질의 독창적인(E-E-A-T) 블로그 글을 작성해줘. 현재 기준 날짜는 ${today} 입니다. 본문이나 제목에서 연도나 날짜를 언급할 때 반드시 이를 기준으로 작성하세요.

정보: ${JSON.stringify(latestItem)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 검색량이 많을 법한 매력적인 제목)
date: ${today}
summary: (독자의 호기심을 자극하는 한 줄 요약)
category: 정보
tags: [태그1, 태그2, tags3]
---

[요약 정보 표]
- 본문 시작 바로 직후(--- 블록 하단)에 아래 형식의 마크다운 표(Table)로 핵심 내용을 1줄 요약해줘:
| 항목 | 내용 |
| --- | --- |
| **신청 대상** | (해당하는 조건/대상 요약) |
| **지원 금액 (또는 혜택)** | (지원 금액이나 혜택 요약) |
| **신청 기간 (또는 행사 기간)** | (신청 기간 또는 행사 날짜 요약) |
| **신청 방법 (또는 장소)** | (신청 방법 및 장소 요약) |

[작성 규칙 및 필수 포맷]
1. 분량: 최소 2,000자 이상(공백 제외)으로 아주 상세하게 작성. (구글 애드센스 필수)
2. 톤앤매너 및 구조: 본문의 모든 소제목은 '##' 또는 '###' 만 사용. (h1 사용 금지)
   - 이번 글은 반드시 아래의 템플릿 유형을 따르세요.
   \${randomTemplate}

3. E-E-A-T (경험, 전문성, 권위, 신뢰) 및 가치 부여 - **가장 중요**
   - 단순한 사실 나열이나 백과사전식 설명은 절대 금지! 구글 '가치 없는 콘텐츠' 판정을 피해야 함.
   - 글의 서론이나 본문 중간에 가상의 에디터(나)가 겪은 구체적인 사례, 실수담, 또는 일상적인 에피소드를 최소 2문단 이상 포함해줘.
   - 독자가 이 글을 읽고 즉시 행동에 옮길 수 있는 나만의 '실전 꿀팁'이나 '주의사항'을 독창적인 시선으로 추가해줘.

4. 내용 구성 필수 요소:
   - 자주 묻는 질문 (FAQ): 독자들이 궁금해할 만한 핵심 질문과 답변 3가지를 '### 자주 묻는 질문 (FAQ)' 섹션으로 작성해줘.
   - 신청/참여 방법: 어떻게 신청하는지 구체적으로 안내하고, 마무리를 따뜻하게 적어줘.

5. 이미지 태그: 마크다운 내 이미지 삽입 시 \`![[지원금/행사 이름] 안내 이미지](이미지주소)\` 형식 사용.

6. [중요: AI 티 제거 (Humanizer 규칙 적용)]: 
   - 번역투("~에 대해", "~를 통해")나 수동태를 절대 사용하지 말고, 자연스러운 능동태 한국어로 써줘.
   - "결론적으로", "따라서" 등 기계적이거나 과장된 표현을 빼고 담백하고 사람 냄새 나게 써줘.
   - "~일 것이다", "~인 것이다" 등 애매한 추측성 말투 대신 확신에 찬 어조로 단언해줘.

마지막 줄에 FILENAME: keyword 형식으로 파일명에 쓰일 영문 단어(소문자, 띄어쓰기 대신 하이픈)만 출력해줘.`;

      let fullContent = '';
      try {
        const result = await utils.fetchGeminiWithFallback(prompt, GEMINI_API_KEY, 'blog');
        fullContent = result.candidates[0].content.parts[0].text;
      } catch (err) {
        console.error(`❌ "${latestItem.name}" 글은 모든 재시도 실패로 최종 생성하지 못했습니다. 다음 글로 넘어갑니다. (원인: ${err.message})\n`);
        continue;
      }

      // [3단계] 파일 저장 및 파일명 추출
      const filenameMatch = fullContent.match(/FILENAME:\s*(.+)/);
      let filename = `${today}-${latestItem.id || 'post'}.md`;
      let blogContent = fullContent;

      if (filenameMatch) {
        let keyword = filenameMatch[1].trim();
        keyword = keyword.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-?/, '');
        filename = `${today}-${keyword}.md`;
        blogContent = fullContent.replace(/FILENAME:\s*.+/, '').trim();
      }

      blogContent = blogContent.replace(/```markdown|```/g, '').trim();

      // YAML Front Matter에서 title과 summary 값을 안전하게 따옴표로 감싸줍니다.
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
              
              // 이미 따옴표로 감싸져 있지 않다면 감싸주기
              if (!((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
                // 내부의 쌍따옴표(")는 이스케이프(\") 처리
                value = value.replace(/"/g, '\\"');
                return `${key}: "${value}"`;
              }
            }
            if (line.startsWith('tags:')) {
              if (!latestItem.link) {
                return line.replace(']', ', 출처확인필요]');
              }
            }
            return line;
          });
          
          // sourceLink 추가 (링크가 없으면 빈 문자열)
          updatedLines.push(`sourceLink: "${latestItem.link || ''}"`);
          updatedLines.push(''); // 프론트매터 닫는 '---' 기호 앞에 줄바꿈이 오도록 강제 추가
          
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
          const slug = filename.replace('.md', ''); // 파일명에서 .md 제거 (URL 경로용)
          const newUrlEntry = `  <url>\n    <loc>https://moa-tips.com/blog/${slug}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
          
          // 중복 등록 방지
          if (!sitemapContent.includes(`<loc>https://moa-tips.com/blog/${slug}/</loc>`)) {
            // </urlset> 바로 앞에 새 url 태그를 삽입합니다.
            sitemapContent = sitemapContent.replace('</urlset>', `${newUrlEntry}</urlset>`);
            fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
            console.log(`   🗺️ 사이트맵(sitemap.xml)에 무사히 등록되었습니다!`);
          }
        } catch (sitemapErr) {
          console.error(`   ⚠️ 사이트맵 업데이트 중 에러:`, sitemapErr.message);
        }
      }

      // [중복 방지 원칙 적용] 기록장에 방금 쓴 행사명과 ID 추가 (Write)
      const recordText = latestItem.id ? `${latestItem.id}|${latestItem.name}` : latestItem.name;
      fs.appendFileSync(historyPath, recordText + '\n', 'utf8');
      
      console.log(`✅ 블로그 글 생성 완료: ${filename}\n`);
    }

  } catch (err) {
    console.error('에러 발생:', err);
  }
}

generatePost();
