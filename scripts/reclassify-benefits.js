const fs = require('fs');
const path = require('path');
const utils = require('./fetch-utils');

async function processBatch(batch, BOKJIRO_API_KEY, GEMINI_API_KEY) {
  // Construct a prompt for the batch
  const itemsJson = JSON.stringify(batch.map((b, i) => ({
    index: i,
    name: b.name,
    target: b.target || '',
    summary: b.summary || ''
  })), null, 2);

  const prompt = `You are a data classification assistant for a Korean welfare benefits platform.
Categorize the following benefits into 3 specific criteria based on their name, target, and summary.
The response must be valid JSON in the exact structure requested, with NO markdown formatting, NO backticks.

Allowed categories for each criterion:

1. serviceField (서비스분야) MUST be one of:
생활안정, 보건 의료, 보육 교육, 농림축산어업, 고용 창업, 임신 출산, 보호 돌봄, 행정 안전, 문화 환경, 주거 자립

2. supportType (지원유형) MUST be one of:
현금, 현금(보험), 현금(융자), 현금(장학금), 현금(감면), 현물, 서비스(돌봄), 서비스(일자리), 이용권, 기타, 기타(교육), 기타(상담), 기술지원, 시설이용

3. targetGroup (대상) MUST be one of:
개인, 가구, 소상공인, 법인/시설/단체

Items to categorize:
${itemsJson}

Return exactly a JSON array of objects with the exact following structure, in the same order as the input:
[
  {
    "index": <number>,
    "serviceField": "<string>",
    "supportType": "<string>",
    "targetGroup": "<string>"
  }
]
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();

    if (data.usageMetadata) {
      const usage = data.usageMetadata;
      console.log(`\n📊 [토큰 사용량] 입력: ${usage.promptTokenCount}개 / 출력: ${usage.candidatesTokenCount}개 / 총합: ${usage.totalTokenCount}개`);
    }

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return null;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    try {
      const parsed = JSON.parse(text.trim());
      return parsed;
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return null;
    }
  } catch (err) {
    console.error("Request failed:", err);
    return null;
  }
}

async function run() {
  utils.loadEnv();
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in .env.local");
    return;
  }

  const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
  const backupPath = path.join(process.cwd(), 'public/data/local-info.json.backup');
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  fs.writeFileSync(backupPath, rawData);
  console.log('Backup created at local-info.json.backup');

  const localData = JSON.parse(rawData);
  const benefitKeys = ['benefits', 'seoulBenefits', 'kyeonggiBenefits', 'incheonBenefits', 'nationalBenefits'];
  
  // Collect all items that need classification
  const itemsToProcess = [];
  for (const key of benefitKeys) {
    if (localData[key]) {
      for (let i = 0; i < localData[key].length; i++) {
        const item = localData[key][i];
        if (!item.serviceField || !item.supportType || !item.targetGroup) {
          itemsToProcess.push({ key, index: i, item });
        }
      }
    }
  }

  console.log(`Found ${itemsToProcess.length} items to classify.`);

  const batchSize = 15;
  for (let i = 0; i < itemsToProcess.length; i += batchSize) {
    const batch = itemsToProcess.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(itemsToProcess.length / batchSize)}...`);
    
    const results = await processBatch(batch.map(b => b.item), null, GEMINI_API_KEY);
    
    if (results && Array.isArray(results)) {
      for (let j = 0; j < results.length; j++) {
        const res = results[j];
        if (res && res.serviceField) {
          const targetItemInfo = batch[res.index || j];
          if (targetItemInfo) {
            const { key, index } = targetItemInfo;
            localData[key][index].serviceField = res.serviceField;
            localData[key][index].supportType = res.supportType;
            localData[key][index].targetGroup = res.targetGroup;
          }
        }
      }
      
      // Save progress after each batch
      fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2), 'utf-8');
    } else {
      console.log(`Failed to process batch ${i / batchSize + 1}. Skipping...`);
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("Classification complete! local-info.json updated.");
}

run();
