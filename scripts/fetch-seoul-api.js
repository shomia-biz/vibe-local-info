const fs = require('fs');
const path = require('path');

// .env.local 파일에서 수동으로 API 키 읽어오기 (별도 도구 설치 없이 실행 가능)
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

async function fetchSeoulEvents() {
  loadEnv(); // 환경변수 로드

  const API_KEY = process.env.SEOUL_DATA_API_KEY;
  
  // 키가 설정되었는지 확인 (키 값을 직접 비교하지 않음)
  if (!API_KEY || API_KEY === '발급받은_인증키_입력' || API_KEY === '') {
    console.error('❌ SEOUL_DATA_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.');
    return;
  }

  const url = `http://openAPI.seoul.go.kr:8088/${API_KEY}/json/culturalEventInfo/1/100/`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (!result.culturalEventInfo || !result.culturalEventInfo.row) {
      console.error('❌ 데이터를 가져오지 못했습니다:', result.RESULT?.MESSAGE || '알 수 없는 오류');
      return;
    }

    const rawEvents = result.culturalEventInfo.row;
    const songpaEvents = rawEvents.filter(event => event.GUNAME === '송파구');
    console.log(`✅ 총 ${songpaEvents.length}개의 송파구 행사를 찾았습니다.`);

    const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    let addedCount = 0;
    songpaEvents.forEach(event => {
      const isDuplicate = localData.events.some(e => e.name === event.TITLE);
      
      if (!isDuplicate) {
        const newEvent = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: event.TITLE,
          category: '행사',
          startDate: event.STRTDATE.split(' ')[0],
          endDate: event.END_DATE.split(' ')[0],
          location: event.PLACE,
          target: event.USE_TRGT || '누구나',
          summary: `${event.TITLE} 행사가 ${event.PLACE}에서 열립니다.`,
          link: event.ORG_LINK,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        localData.events.unshift(newEvent);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2), 'utf8');
      console.log(`🎉 ${addedCount}개의 새로운 송파구 행사가 추가되었습니다!`);
    } else {
      console.log('✨ 이미 최신 상태입니다. 추가할 새로운 행사가 없습니다.');
    }

  } catch (err) {
    console.error('❌ 실행 중 오류 발생:', err);
  }
}

fetchSeoulEvents();
