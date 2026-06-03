const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../public/data/local-info.json');

try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const originalLength = data.events ? data.events.length : 0;

  if (originalLength > 0) {
    // events 배열에서 '행사'이면서 '서울'인 항목을 찾아내서 제외시킵니다.
    data.events = data.events.filter(item => !(item.category === '행사' && item.region === '서울'));
    const newLength = data.events.length;
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`✅ 중복 데이터 정리 완료! (총 ${originalLength - newLength}개의 항목이 events 배열에서 삭제되었습니다.)`);
  } else {
    console.log('events 배열이 비어있거나 없습니다.');
  }
} catch (err) {
  console.error('에러 발생:', err);
}
