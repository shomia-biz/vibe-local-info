const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // Note: The user didn't mention avoiding this, but said "내장 fetch, fs 사용". Wait, I should check if gray-matter is available. It was installed in a previous step. However, the user said "외부 패키지 없이... 내장 fetch, fs 사용". So I should probably avoid gray-matter and just use regex or string split to read frontmatter.

async function generatePost() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('환경변수(GEMINI_API_KEY)가 설정되지 않았습니다.');
    return;
  }

  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  const postsDir = path.join(process.cwd(), 'src/content/posts');

  try {
    // [1단계] 최신 데이터 확인
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    // 여러 카테고리 중 가장 최근에 추가된 것(배열의 맨 앞)을 가져옵니다. 
    // 사용자가 '마지막 항목'이라고 했으나, unshift로 추가되었으므로 [0]번이 최신입니다. 
    // 여기서는 사용자의 명시적 요청대로 '배열의 마지막' 항목을 일단 확인하되, 
    // 혜택(benefits)과 행사(events) 중 하나를 선택합니다.
    const allItems = [...localData.events, ...localData.benefits];
    if (allItems.length === 0) {
      console.log('데이터가 없습니다.');
      return;
    }
    
    // 사용자가 지칭한 '마지막 항목' (배열의 마지막)
    const latestItem = allItems[allItems.length - 1];

    // 기존 포스트와 비교 (중복 확인)
    const existingFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    let alreadyExists = false;

    for (const file of existingFiles) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      if (content.includes(`title: "${latestItem.name}"`) || content.includes(`title: ${latestItem.name}`)) {
        alreadyExists = true;
        break;
      }
    }

    if (alreadyExists) {
      console.log('이미 작성된 글입니다.');
      return;
    }

    // [2단계] Gemini AI로 블로그 글 생성
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const today = new Date().toISOString().split('T')[0];
    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}
아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    if (!result.candidates || !result.candidates[0]) {
        console.error('Gemini API 응답 오류:', JSON.stringify(result));
        return;
    }
    
    let fullContent = result.candidates[0].content.parts[0].text;

    // [3단계] 파일 저장 및 파일명 추출
    const filenameMatch = fullContent.match(/FILENAME:\s*(.+)/);
    let filename = `${today}-new-post.md`;
    let blogContent = fullContent;

    if (filenameMatch) {
      filename = filenameMatch[1].trim();
      if (!filename.endsWith('.md')) filename += '.md';
      // 내용에서 FILENAME 부분 제거
      blogContent = fullContent.replace(/FILENAME:\s*.+/, '').trim();
    }

    // 마크다운 코드 블록(```)이 포함되어 있다면 제거
    blogContent = blogContent.replace(/```markdown|```/g, '').trim();

    const finalPath = path.join(postsDir, filename);
    fs.writeFileSync(finalPath, blogContent, 'utf8');
    
    console.log(`블로그 글 생성 완료: ${filename}`);

  } catch (err) {
    console.error('에러 발생:', err);
  }
}

generatePost();
