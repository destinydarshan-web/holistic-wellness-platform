ook 'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BlogCard } from '@/components/blog-card'
import { Button } from '@/components/ui/button'
import { blogPosts, categories } from '@/data/blog-posts'
import { BookOpen, Filter, Search, Calendar, User } from 'lucide-react'

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true
    const matchesSearch = searchQuery 
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0F0F14]">
      <Navigation />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="px-6 py-20 bg-gradient-to-br from-[#0F0F14] to-[#1C1C24]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#fdce20]/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[#fdce20]" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Wellness <span className="text-[#fdce20]">Blog</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover insights, tips, and wisdom on astrology, counselling, yoga, and meditation to transform your life.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#fdce20] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-6 py-8 border-b border-white/10">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#fdce20]" />
                Categories
              </h2>
              <p className="text-sm text-gray-400">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-[#fdce20] text-black shadow-lg'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                All Articles
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-[#fdce20] text-black shadow-lg'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="px-6 py-16">
          <div className="max-w-[1200px] mx-auto">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    category={post.category}
                    date={post.date}
                    author={post.author}
                    image={post.image}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No Articles Found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Try adjusting your search terms or browse different categories to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
