const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
const today = new Date().toISOString().split('T')[0];

try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  // 1. 특정 항목 삭제
  const itemsToRemove = ['옵서버 승선경비 지원', '해양사고 국선 심판변론인 선정 지원', '해양사고 국선 심판변론인 선정지원'];
  
  const filterItems = (items) => {
    if (!items) return [];
    return items.filter(item => !itemsToRemove.includes(item.name));
  };

  data.events = filterItems(data.events);
  data.benefits = filterItems(data.benefits);
  data.seoulEvents = filterItems(data.seoulEvents);
  data.nationalEvents = filterItems(data.nationalEvents);

  // 2. 모든 항목에 updatedAt 추가
  const addDate = (items) => {
    if (!items) return [];
    return items.map(item => ({
      ...item,
      updatedAt: item.updatedAt || today
    }));
  };

  data.events = addDate(data.events);
  data.benefits = addDate(data.benefits);
  data.seoulEvents = addDate(data.seoulEvents);
  data.nationalEvents = addDate(data.nationalEvents);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully cleaned up items and updated all dates.');
} catch (err) {
  console.error('Error cleaning data:', err);
}
