const fs = require('fs');
const path = require('path');

const guideDir = path.join(__dirname, '../src/content/guide');
const files = fs.readdirSync(guideDir).filter(f => f.endsWith('.md'));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3\-]/g, '')
    .replace(/\s+/g, '-');
}

for (const file of files) {
  const filePath = path.join(guideDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has TOC
  if (content.includes('## 목차')) continue;

  const lines = content.split('\n');
  
  let thumbnail = '';
  for (let line of lines) {
    if (line.startsWith('thumbnail:')) {
      thumbnail = line.replace('thumbnail:', '').replace(/['"]/g, '').trim();
      break;
    }
  }

  const headers = [];
  let inFrontmatter = false;
  let frontmatterEndIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line.startsWith('---')) {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter && line.startsWith('---')) {
      inFrontmatter = false;
      frontmatterEndIdx = i;
      continue;
    }
    if (!inFrontmatter && (line.startsWith('## ') || line.startsWith('### '))) {
      headers.push(line);
    }
  }

  let toc = `![대표 이미지](${thumbnail})\n\n## 목차\n`;
  for (const header of headers) {
    const isH3 = header.startsWith('### ');
    const text = header.replace(/^#+\s/, '');
    const slug = slugify(text);
    const indent = isH3 ? '  - ' : '- ';
    toc += `${indent}[${text}](#${slug})\n`;
  }

  if (frontmatterEndIdx !== -1) {
    lines.splice(frontmatterEndIdx + 1, 0, '\n' + toc.trim());
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`Updated ${file}`);
}
