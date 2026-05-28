import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'data', 'qna-data.json');

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();
    
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const questions = JSON.parse(fileContent);
    
    const question = questions.find((q: any) => q.id === id);
    if (!question) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (question.password === password) {
      // 비밀번호 일치 시 내용 포함 반환
      return NextResponse.json({ success: true, question });
    } else {
      return NextResponse.json({ success: false, error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Password Verification Error:', error);
    return NextResponse.json({ error: '인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
