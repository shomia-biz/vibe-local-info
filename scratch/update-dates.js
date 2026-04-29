const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
const today = new Date().toISOString().split('T')[0];

try {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  const updateItems = (items) => {
    if (!items) return [];
    return items.map(item => ({
      ...item,
      updatedAt: item.updatedAt || today
    }));
  };

  data.events = updateItems(data.events);
  data.benefits = updateItems(data.benefits);
  data.seoulEvents = updateItems(data.seoulEvents);
  data.nationalEvents = updateItems(data.nationalEvents);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Successfully updated all items with updatedAt date.');
} catch (err) {
  console.error('Error updating data:', err);
}
