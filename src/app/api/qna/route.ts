import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'data', 'qna-data.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const questions = JSON.parse(fileContent);
    
    // 보안을 위해 비밀글의 비밀번호는 클라이언트로 보내지 않습니다.
    const safeQuestions = questions.map((q: any) => {
      const { password, ...safeQ } = q;
      return safeQ;
    });

    return NextResponse.json(safeQuestions);
  } catch (error) {
    console.error('Failed to read QnA data:', error);
    // 파일이 없으면 빈 배열 반환
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const newQuestion = await req.json();
    
    // 고유 ID 및 시간 추가
    newQuestion.id = Date.now().toString();
    newQuestion.createdAt = new Date().toISOString();
    newQuestion.status = '답변대기';

    let questions = [];
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      questions = JSON.parse(fileContent);
    } catch (e) {
      // 파일이 없는 경우 빈 배열로 시작
    }

    questions.unshift(newQuestion); // 최신 글을 맨 앞에 추가
    await fs.writeFile(dataPath, JSON.stringify(questions, null, 2));

    // 글이 작성되면 메일 전송 API를 호출 (백그라운드 비동기 처리)
    fetch(new URL('/api/send-email', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion)
    }).catch(e => console.error('이메일 전송 호출 실패:', e));

    return NextResponse.json({ success: true, id: newQuestion.id });
  } catch (error: any) {
    console.error('Failed to write QnA data:', error);
    return NextResponse.json({ error: '게시글 저장에 실패했습니다.' }, { status: 500 });
  }
}
