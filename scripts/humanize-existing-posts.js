const fs = require('fs');
const path = require('path');
const utils = require('./fetch-utils');

async function runHumanizerBatch() {
  utils.loadEnv();
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('환경변수(GEMINI_API_KEY)가 설정되지 않았습니다.');
    return;
  }

  const postsDir = path.join(process.cwd(), 'src/content/posts');
  let existingFiles = [];
  try {
    existingFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  } catch (err) {
    console.error('포스트 디렉토리를 읽을 수 없습니다.', err);
    return;
  }

  console.log(`\n총 ${existingFiles.length}개의 포스트를 검사하여 AI 티 제거(Humanizer) 작업을 시작합니다...`);

  let count = 0;
  for (let i = 0; i < existingFiles.length; i++) {
    const filename = existingFiles[i];
    const filePath = path.join(postsDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');

    // 이미 윤문 처리된 파일은 건너뜁니다.
    if (content.includes('humanized: true')) {
      console.log(`⏭️ [${i + 1}/${existingFiles.length}] ${filename} 은(는) 이미 사람 냄새 나는 글로 수정되어 건너뜁니다.`);
      continue;
    }

    console.log(`🤖 [${i + 1}/${existingFiles.length}] ${filename} 파일 윤문 중...`);
    
    // API 호출 속도 제한 방지 대기
    if (count > 0) await utils.sleep(5000); 

    const prompt = `다음은 자동 생성된 블로그 포스트의 원본 마크다운 파일 내용입니다.
이 글을 내용(팩트, 수치 등)의 손실 없이, 아래의 [AI 티 제거 (Humanizer 규칙)]을 철저히 적용하여 '진짜 사람이 쓴 것처럼' 완벽하게 윤문(수정)해 주세요.

[AI 티 제거 (Humanizer 규칙)]
1. 번역투("~에 대해", "~를 통해", "~할 수 있다", "~의해")나 수동태를 절대 사용하지 말고, 자연스러운 능동태 한국어로 쓰세요.
2. "결론적으로", "따라서", "혁명적", "파격적", "압도적" 등 기계적이거나 과장된 표현을 빼고 담백하게 쓰세요.
3. "~일 것이다", "~인 것이다" 등 애매한 추측성 말투 대신 확신에 찬 어조로 단언하세요.
4. 문장 길이를 다양하게 섞고, "~다"로 끝나는 문장이 3번 이상 연속되지 않게 리듬감 있게 작성하세요.
5. 블로그 원본의 상단 설정(YAML Front Matter, 즉 --- 와 --- 사이의 내용)은 그대로 유지하되, 그 안에 'humanized: true' 라는 줄을 한 줄 추가하세요.

출력은 어떠한 설명이나 백틱(\`\`\`) 없이 오직 최종 변환된 마크다운 파일의 전체 내용만 출력해야 합니다.

원본 내용:
${content}`;

    try {
      const result = await utils.fetchGeminiWithFallback(prompt, GEMINI_API_KEY, 'blog');
      let newContent = result.candidates[0].content.parts[0].text;
      
      // 불필요한 마크다운 코드블록 제거
      newContent = newContent.replace(/^```(markdown)?\n/, '').replace(/\n```$/, '').trim();

      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ 윤문 완료: ${filename}`);
      count++;
    } catch (err) {
      console.error(`❌ ${filename} 처리 중 오류 발생: ${err.message}`);
      // 중단하지 않고 다음 파일로 진행
    }
  }

  console.log(`\n🎉 모든 작업이 완료되었습니다! 총 ${count}개의 파일이 새롭게 윤문되었습니다.`);
}

runHumanizerBatch();
