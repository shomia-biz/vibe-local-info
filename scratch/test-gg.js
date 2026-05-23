const path = require('path');
const fs = require('fs');

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

async function testGG() {
  loadEnv();
  const cleanKey = (key) => key ? key.replace(/^\[[^\]]+\]\s*/, '').trim() : '';
  const KYEONGGI_DATA_API_KEY = cleanKey(process.env.KYEONGGI_DATA_API_KEY);

  const url = `https://openapi.gg.go.kr/CultureFestival?KEY=${KYEONGGI_DATA_API_KEY}&Type=json&pIndex=1&pSize=5`;
  console.log('Testing URL:', url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('Raw response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testGG();
