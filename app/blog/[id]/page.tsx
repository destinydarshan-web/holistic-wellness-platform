import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { blogPosts } from '@/data/blog-posts'
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Import fonts for consistency
import { Poppins, Merriweather } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
})

interface BlogDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogDetailPage({
  params,
}: BlogDetailPageProps) {
  const { id } = await params
  const post = blogPosts.find((p) => p.id === id)

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3)

  return (
    <div className={`min-h-screen flex flex-col bg-[#0F0F14] ${poppins.variable} ${merriweather.variable}`}>
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Article Header */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 mb-6 gap-2">
                <ArrowLeft size={16} />
                Back to Blog
              </Button>
            </Link>
            <Badge className="bg-primary text-primary-foreground mb-4">
              {post.category}
            </Badge>
            <h1 className={`text-4xl md:text-5xl font-bold text-white mb-4 text-balance ${merriweather.className}`}>
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span>by {post.author}</span>
              <span>•</span>
              <span>{formatDate(post.date)}</span>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {post.image && (
              <div className="w-full h-96 mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <article className="prose prose-sm md:prose-base max-w-none text-gray-100 prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400 prose-blockquote:text-gray-400 prose-code:text-gray-100">
              <p className="text-lg text-gray-100 leading-relaxed mb-6">
                {post.content}
              </p>
              <p className="text-lg text-gray-100 leading-relaxed mb-6">
                {post.excerpt}
              </p>
            </article>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <h2 className={`text-3xl font-bold text-white mb-8 ${merriweather.className}`}>
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="p-6 hover:shadow-lg transition-shadow">
                    <Badge variant="outline" className="border-primary text-primary mb-3">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 text-balance">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <Link href={`/blog/${relatedPost.id}`}>
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
                      >
                        Read More
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
