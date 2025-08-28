import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  readingTime: number;
}

export interface BlogMetadata {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  readingTime: number;
}

const POSTS_PATH = path.join(process.cwd(), 'content/blog');

// Ensure content directory exists
if (!fs.existsSync(POSTS_PATH)) {
  fs.mkdirSync(POSTS_PATH, { recursive: true });
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }
  
  return fs.readdirSync(POSTS_PATH)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(POSTS_PATH, `${slug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      tags: data.tags || [],
      author: data.author || { name: 'WonderKids Team' },
      content,
      readingTime,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(): BlogMetadata[] {
  const slugs = getPostSlugs();
  
  return slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      
      const { content, ...metadata } = post;
      return metadata;
    })
    .filter((post): post is BlogMetadata => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostsByTag(tag: string): BlogMetadata[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagCounts = new Map<string, number>();
  
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.keys()).sort();
}

export function getTagCounts(): Record<string, number> {
  const posts = getAllPosts();
  const tagCounts: Record<string, number> = {};
  
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
}
