import Link from 'next/link';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { getAllPosts, getAllTags, getTagCounts } from '@/src/lib/blog';

export const metadata = {
  title: 'Blog - WonderKids English',
  description: 'Tips, guides, and insights for helping your child learn English effectively.',
};

interface BlogPageProps {
  searchParams: Promise<{
    tag?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag: selectedTag } = await searchParams;
  const allPosts = getAllPosts();
  const posts = selectedTag 
    ? allPosts.filter(post => post.tags.includes(selectedTag))
    : allPosts;
  
  const tags = getAllTags();
  const tagCounts = getTagCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WonderKids Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and insights for helping your child learn English effectively
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Status */}
            {selectedTag && (
              <div className="mb-6 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Showing posts tagged with <strong>{selectedTag}</strong>
                </span>
                <Link href="/blog" className="text-blue-600 hover:text-blue-700 text-sm">
                  Clear filter
                </Link>
              </div>
            )}

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {selectedTag 
                    ? `No posts found with tag "${selectedTag}"`
                    : 'No blog posts yet. Check back soon!'
                  }
                </p>
                {selectedTag && (
                  <Link href="/blog">
                    <Button variant="outline">View all posts</Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.slug} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-4">
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readingTime} min read</span>
                        </div>
                      </div>

                      {/* Title and Excerpt */}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          <Link 
                            href={`/blog/${post.slug}` as any}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Tags and Read More */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Link
                              key={tag}
                              href={`/blog?tag=${encodeURIComponent(tag)}`}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              {tag}
                            </Link>
                          ))}
                        </div>
                        
                        <Link href={`/blog/${post.slug}` as any}>
                          <Button variant="outline" size="sm">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Tags */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                {tags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTag === tag
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                        <span className="ml-1 text-xs opacity-75">
                          ({tagCounts[tag]})
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              {/* RSS Feed */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Subscribe to our RSS feed to get the latest posts delivered to your feed reader.
                </p>
                <Link href="/rss.xml" target="_blank">
                  <Button variant="outline" size="sm" className="w-full">
                    RSS Feed
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
