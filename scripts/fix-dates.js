const fs = require('fs');
const path = require('path');

const today = '2026-08-19';
const postsDir = path.join(process.cwd(), 'src/content/posts');
const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');

let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

let modifiedCount = 0;

for (const file of files) {
  const slug = file.replace('.md', '');
  
  // sitemap.xml에서 현재 파일의 loc와 lastmod를 찾습니다.
  const sitemapRegex = new RegExp(`<loc>https://moa-tips.com/blog/${slug}/</loc>\\s*<lastmod>(.*?)</lastmod>`);
  const match = sitemapContent.match(sitemapRegex);
  
  if (match) {
    const lastmod = match[1];
    const fileDatePrefixMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
    const fileDatePrefix = fileDatePrefixMatch ? fileDatePrefixMatch[1] : null;
    
    // 파일명의 날짜와 실제 발행일(lastmod)이 다르면 수정 대상입니다.
    if (fileDatePrefix && fileDatePrefix !== lastmod) {
      console.log(`수정 중인 파일: ${file}`);
      
      const keyword = file.replace(/^\d{4}-\d{2}-\d{2}-?/, '');
      const newFilename = `${today}-${keyword}`;
      const oldPath = path.join(postsDir, file);
      const newPath = path.join(postsDir, newFilename);
      
      // 본문 파일의 frontmatter date 업데이트
      let content = fs.readFileSync(oldPath, 'utf8');
      content = content.replace(/date:\s*["']?\d{4}-\d{2}-\d{2}["']?/, `date: ${today}`);
      
      // 파일명 변경 (새로 쓰고 예전 파일 삭제)
      fs.writeFileSync(newPath, content, 'utf8');
      fs.unlinkSync(oldPath);
      
      // sitemap.xml 업데이트
      const oldBlockRegex = new RegExp(`<loc>https://moa-tips.com/blog/${slug}/</loc>\\s*<lastmod>${lastmod}</lastmod>`);
      const newBlock = `<loc>https://moa-tips.com/blog/${newFilename.replace('.md', '')}/</loc>\n    <lastmod>${today}</lastmod>`;
      sitemapContent = sitemapContent.replace(oldBlockRegex, newBlock);
      
      modifiedCount++;
    }
  }
}

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log(`총 ${modifiedCount}개의 파일과 sitemap을 오늘 날짜(${today})로 수정 완료했습니다.`);
