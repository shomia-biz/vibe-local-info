import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const question = await req.json();

    // 회원님이 이메일 환경(SMTP 또는 메일 API)을 설정하기 전까지는 콘솔에 출력만 하고 마칩니다.
    // 향후 이 부분에 nodemailer 모듈을 추가하여 실제 이메일을 발송하게 됩니다.
    
    console.log('--- [이메일 발송 흉내내기] ---');
    console.log(`알림! 새로운 Q&A 문의가 등록되었습니다.`);
    console.log(`제목: ${question.title}`);
    console.log(`작성자: ${question.author}`);
    console.log(`내용: ${question.content}`);
    console.log(`비밀글여부: ${question.isPrivate ? '예' : '아니오'}`);
    console.log('------------------------------');

    return NextResponse.json({ success: true, message: '이메일 발송(테스트) 완료' });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: '이메일 전송 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
