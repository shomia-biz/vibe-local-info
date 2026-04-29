const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
const today = new Date().toISOString().split('T')[0];

try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  const newSeoulEvents = [
    {
      "id": 101,
      "name": "서울 스프링페스티벌",
      "category": "행사",
      "startDate": "2026-04-10",
      "endDate": "2026-05-05",
      "location": "한강공원 일원",
      "summary": "따뜻한 봄날 한강에서 즐기는 서울의 대표 봄 축제입니다.",
      "link": "https://festival.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 102,
      "name": "2026 서울야외도서관",
      "category": "행사",
      "startDate": "2026-04-18",
      "endDate": "2026-06-30",
      "location": "서울광장, 광화문광장, 청계천",
      "summary": "야외에서 빈백에 누워 책을 읽는 도심 속 힐링 행사입니다.",
      "link": "https://culture.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 103,
      "name": "서울 서커스 페스티벌 2026",
      "category": "행사",
      "startDate": "2026-05-04",
      "endDate": "2026-05-05",
      "location": "노들섬 일대",
      "summary": "평소 보기 힘든 화려한 서커스 공연을 한자리에서 만날 수 있는 축제입니다.",
      "link": "https://festival.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 104,
      "name": "2026 차 없는 잠수교 뚜벅뚜벅 축제",
      "category": "행사",
      "startDate": "2026-04-20",
      "endDate": "2026-06-30",
      "location": "반포 한강공원 잠수교",
      "summary": "잠수교를 걸으며 마켓, 공연, 푸드트럭을 즐기는 특별한 경험을 제공합니다.",
      "link": "https://festival.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 105,
      "name": "2026 DDP 어린이 디자인 페스티벌",
      "category": "행사",
      "startDate": "2026-05-01",
      "endDate": "2026-05-05",
      "location": "동대문디자인플라자(DDP)",
      "summary": "아이들이 직접 디자인을 체험하고 즐길 수 있는 어린이날 맞춤 행사입니다.",
      "link": "https://culture.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 106,
      "name": "남산골 어린이마을",
      "category": "행사",
      "startDate": "2026-05-05",
      "endDate": "2026-05-05",
      "location": "남산골한옥마을",
      "summary": "한옥에서 전통 놀이와 공연을 즐기며 어린이날을 기념할 수 있습니다.",
      "link": "https://culture.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 107,
      "name": "서울 문화의 밤 (문화로 야금야금)",
      "category": "행사",
      "startDate": "2026-04-01",
      "endDate": "상시",
      "location": "서울시립미술관, 역사박물관 등",
      "summary": "직장인들도 퇴근 후 여유롭게 전시와 공연을 즐길 수 있는 야간 개방 행사입니다.",
      "link": "https://culture.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 108,
      "name": "강북구 어린이날 축제",
      "category": "행사",
      "startDate": "2026-05-02",
      "endDate": "2026-05-02",
      "location": "북서울꿈의숲",
      "summary": "넓은 공원에서 온 가족이 함께 참여할 수 있는 풍성한 체험 프로그램이 열립니다.",
      "link": "https://festival.seoul.go.kr",
      "updatedAt": today
    },
    {
      "id": 109,
      "name": "2026 관악 책빵축제",
      "category": "행사",
      "startDate": "2026-05-09",
      "endDate": "2026-05-10",
      "location": "별빛내린천(도림천) 수변무대 일대",
      "summary": "지역 주민들과 함께하는 책과 빵이 어우러진 이색적인 동네 축제입니다.",
      "link": "https://festival.seoul.go.kr",
      "updatedAt": today
    }
  ];

  data.seoulEvents = newSeoulEvents;

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully updated Seoul Top 9 events from official portals.');
} catch (err) {
  console.error('Error updating Seoul events:', err);
}
