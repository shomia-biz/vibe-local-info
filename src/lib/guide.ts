import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const guideDirectory = path.join(process.cwd(), 'src/content/guide');

export interface GuideData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  thumbnail: string;
  cta_link?: string;
  content: string;
}

export function getSortedGuidesData(): GuideData[] {
  if (!fs.existsSync(guideDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(guideDirectory);
  const allGuidesData = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(guideDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      let dateString = '';
      if (data.date instanceof Date) {
        dateString = data.date.toISOString().split('T')[0];
      } else {
        dateString = String(data.date || '');
      }

      return {
        slug,
        title: data.title || '',
        date: dateString,
        summary: data.summary || '',
        category: data.category || '일반',
        tags: data.tags || [],
        thumbnail: data.thumbnail || '/images/default-thumbnail.jpg',
        cta_link: data.cta_link || '',
        content,
      } as GuideData;
    });

  return allGuidesData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getGuideData(slug: string): GuideData | null {
  const fullPathMd = path.join(guideDirectory, `${slug}.md`);
  const fullPathMdx = path.join(guideDirectory, `${slug}.mdx`);
  
  let fullPath = '';
  if (fs.existsSync(fullPathMd)) {
    fullPath = fullPathMd;
  } else if (fs.existsSync(fullPathMdx)) {
    fullPath = fullPathMdx;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let dateString = '';
  if (data.date instanceof Date) {
    dateString = data.date.toISOString().split('T')[0];
  } else {
    dateString = String(data.date || '');
  }

  return {
    slug,
    title: data.title || '',
    date: dateString,
    summary: data.summary || '',
    category: data.category || '일반',
    tags: data.tags || [],
    thumbnail: data.thumbnail || '/images/default-thumbnail.jpg',
    cta_link: data.cta_link || '',
    content,
  };
}
