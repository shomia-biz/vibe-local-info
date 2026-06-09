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

    // 기존 포스트 파일들 읽기
    const existingFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const existingContents = existingFiles.map(file => fs.readFileSync(path.join(postsDir, file), 'utf8'));

    // 1회 실행 당 최대 생성할 블로그 글 수 (필요시 숫자를 변경하시면 됩니다)
    const MAX_POSTS_TO_GENERATE = 3;

    // 아직 글을 작성하지 않은 '최신' 항목 찾기 (최대 MAX_POSTS_TO_GENERATE개 수집)
    const targetItems = [];
    for (const item of allItems) {
      if (targetItems.length >= MAX_POSTS_TO_GENERATE) {
        break;
      }

      // 제목이나 본문에 해당 데이터의 이름이 포함되어 있는지 확인
      const alreadyPosted = existingContents.some(content => 
        content.includes(item.name) || 
        (content.includes('title:') && content.includes(item.name))
      );

      if (!alreadyPosted) {
        targetItems.push(item);
      }
    }

    if (targetItems.length === 0) {
      console.log('모든 최신 데이터에 대해 이미 블로그 글이 작성되었습니다. 새 글 생성을 건너뜁니다.');
      return;
    }

    console.log(`\n📝 블로그 글이 없는 신규 데이터 ${targetItems.length}개를 발견했습니다. 순차적으로 생성을 시작합니다.\n`);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const today = new Date().toISOString().split('T')[0];

    // [2단계] 루프를 돌며 각 아이템에 대한 블로그 글 생성
    for (let i = 0; i < targetItems.length; i++) {
      const latestItem = targetItems[i];
      console.log(`🤖 [${i + 1}/${targetItems.length}] "${latestItem.name}" 정보로 블로그 글 생성 중...`);

      // 무료 AI 한도(RPM) 초과 에러를 완벽하게 피하기 위해 대기 시간을 25초로 넉넉히 늘립니다.
      if (i > 0) {
        console.log(`⏳ 안정적인 생성을 위해 25초간 대기합니다...`);
        await sleep(25000);
      }

      const prompt = `아래 공공서비스 정보를 바탕으로 검색엔진(SEO)에 최적화된 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
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

(본문 내용: 800자 이상, 친근하고 다정한 블로그 톤)
- 본문 내의 모든 소제목은 반드시 '## 소제목' (h2) 또는 '### 소제목' (h3)만 사용해줘. 단 하나의 '#' (h1)은 페이지 전체 제목에서만 사용되므로 본문 안에서는 절대 사용하면 안 돼!
- 추천 이유 3가지를 본문 소제목(##)과 함께 자세히 작성해줘. 특히 추천 이유의 각 제목(예: **첫째, ...**)을 작성한 후에는 반드시 끝에 공백 2칸을 넣고 줄바꿈(엔터 1번)을 해서 바로 다음 줄에 본문 내용이 붙어 나오게 작성해줘.
- 신청 방법 또는 예매 방법을 마지막에 상세히 적어줘.
- 혹시 본문 내에 이미지가 포함되는 마크다운을 작성할 일이 있다면, 반드시 대체 텍스트(alt)에 '![[지원금/행사 이름] 안내 이미지](이미지주소)' 형식이 들어가도록 작성해줘.

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

      let response;
      let result;
      const backoffDelays = [25000, 35000, 60000];
      let attempt = 0;

      while (attempt < backoffDelays.length) {
        let errDetail = '';
        try {
          response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          result = await response.json();

          if (result.candidates && result.candidates[0]) {
            break; // 성공 시 루프 탈출
          }

          errDetail = result.error ? result.error.message : JSON.stringify(result);
        } catch (fetchErr) {
          errDetail = fetchErr.message;
        }

        const delay = backoffDelays[attempt];
        console.warn(`   ⚠️ Gemini API 한도 초과 또는 오류. ${delay/1000}초 후 다시 시도합니다... (원인: ${errDetail})`);
        await sleep(delay);
        attempt++;
      }

      if (!result || !result.candidates || !result.candidates[0]) {
        console.error(`❌ "${latestItem.name}" 글은 최종적으로 생성하지 못했습니다. 다음 글로 넘어갑니다.\n`);
        continue;
      }

      let fullContent = result.candidates[0].content.parts[0].text;

      // [3단계] 파일 저장 및 파일명 추출
      const filenameMatch = fullContent.match(/FILENAME:\s*(.+)/);
      let filename = `${today}-${latestItem.id || 'post'}.md`;
      let blogContent = fullContent;

      if (filenameMatch) {
        filename = filenameMatch[1].trim();
        if (!filename.endsWith('.md')) filename += '.md';
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
            return line;
          });
          parts[1] = updatedLines.join('\n');
          blogContent = parts.join('---');
        }
      }

      const finalPath = path.join(postsDir, filename);
      fs.writeFileSync(finalPath, blogContent, 'utf8');

      console.log(`✅ 블로그 글 생성 완료: ${filename}\n`);
    }

  } catch (err) {
    console.error('에러 발생:', err);
  }
}

generatePost();
