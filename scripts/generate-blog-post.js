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
  const GEMINI_API_KEY = cleanKey(process.env.GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    console.error('환경변수(GEMINI_API_KEY)가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.');
    return;
  }

  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  try {
    // [1단계] 최신 데이터 확인
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // 모든 항목(행사 + 혜택)을 하나로 합칩니다. 
    // unshift로 추가되었으므로 앞쪽이 최신입니다.
    const allItems = [...localData.events, ...localData.benefits];
    
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

      // API 과부하 및 속도 제한(RPM) 우회를 위해, 첫 번째 아이템이 아니라면 앞선 호출 후 4.5초 대기
      if (i > 0) {
        console.log(`⏳ 안정적인 생성을 위해 4.5초간 대기합니다...`);
        await sleep(4500);
      }

      const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}
아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, tags3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

      let response;
      let result;
      let retries = 3;

      while (retries > 0) {
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
          console.warn(`   ⚠️ Gemini API 요청 실패 (남은 시도: ${retries - 1}회). 원인: ${errDetail}`);
        } catch (fetchErr) {
          errDetail = fetchErr.message;
          console.warn(`   ⚠️ Gemini API 통신 오류 (남은 시도: ${retries - 1}회). 원인: ${errDetail}`);
        }

        retries--;
        if (retries > 0) {
          let waitMs = 5000;
          if (errDetail.includes('Please retry in')) {
            const match = errDetail.match(/Please retry in ([\d\.]+)\s*s/);
            if (match && match[1]) {
              waitMs = (parseFloat(match[1]) + 1.5) * 1000;
              console.log(`   ⏳ API 사용량 초과! 안내된 시간(${match[1]}초)보다 조금 더 넉넉히 대기합니다 (${(waitMs / 1000).toFixed(1)}초 대기)...`);
            } else {
              console.log(`   ⏳ 5초 후에 다시 시도합니다...`);
            }
          } else {
            console.log(`   ⏳ 5초 후에 다시 시도합니다...`);
          }
          await sleep(waitMs);
        }
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
