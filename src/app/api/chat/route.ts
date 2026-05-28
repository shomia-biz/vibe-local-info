import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

// .env.local에 저장된 API 키를 가져옵니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    // 로컬 데이터(공고 내용)를 읽어와서 AI에게 컨텍스트로 제공합니다.
    const dataPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    const dataContent = await fs.readFile(dataPath, 'utf-8');
    
    // AI에게 내릴 프롬프트(명령어)
    const prompt = `
당신은 '수도권 모아팁스'의 친절한 AI 상담원입니다.
다음은 현재 저희 사이트에 등록된 소상공인 지원금 및 행사 데이터입니다:
${dataContent}

사용자의 질문:
"${userMessage}"

위 데이터를 바탕으로 사용자의 질문에 친절하고 전문적으로, 하지만 초보자도 이해하기 쉽게 답변해주세요.
데이터에 없는 내용이거나 너무 구체적인 상담이 필요하다면 "채팅창 아래의 [1:1 문의글 남기기] 버튼을 누르거나, 화면 우측 하단의 노란색 카카오톡 버튼을 눌러 관리자에게 직접 문의해주세요!"라고 안내해주세요.
답변은 길지 않게 요점만 간결하게 작성해주세요.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'AI 응답을 생성하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
