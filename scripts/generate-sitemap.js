const fs = require('fs');
const path = require('path');

function generateSitemap() {
  console.log('🌐 Generating sitemap.xml...');

  const domain = 'https://vibe-local-info.pages.dev';
  const today = new Date().toISOString().split('T')[0];

  // 기본 페이지 정의
  const staticPages = [
    { loc: `${domain}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${domain}/blog/`, priority: '0.8', changefreq: 'daily' },
    { loc: `${domain}/about/`, priority: '0.5', changefreq: 'weekly' },
    { loc: `${domain}/contact/`, priority: '0.5', changefreq: 'weekly' },
    { loc: `${domain}/fortune/`, priority: '0.5', changefreq: 'daily' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. 기본 정적 페이지 추가
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // 2. 블로그 포스트 동적 추가
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    files.forEach(file => {
      const slug = file.replace(/\.md$/, '');
      const postPath = path.join(postsDir, file);
      
      // 파일 수정일 또는 파일명에서 날짜 파싱 시도 (파일명 형식: YYYY-MM-DD-...)
      let postDate = today;
      const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        postDate = dateMatch[1];
      } else {
        try {
          const stats = fs.statSync(postPath);
          postDate = stats.mtime.toISOString().split('T')[0];
        } catch (e) {
          // 기본값 유지
        }
      }

      xml += '  <url>\n';
      xml += `    <loc>${domain}/blog/${slug}/</loc>\n`;
      xml += `    <lastmod>${postDate}</lastmod>\n`;
      xml += '  </url>\n';
    });
  }

  xml += '</urlset>\n';

  const outputPath = path.join(process.cwd(), 'public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`✅ sitemap.xml generated successfully at: ${outputPath}`);
}

generateSitemap();
