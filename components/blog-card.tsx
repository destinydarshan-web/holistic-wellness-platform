'use client'

import Link from 'next/link'
import { ArrowRight, Calendar, User, Clock } from 'lucide-react'

interface BlogCardProps {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  author: string
  image?: string
}

export function BlogCard({
  id,
  title,
  excerpt,
  category,
  date,
  author,
  image,
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getReadTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <div className="bg-[#1C1C24] rounded-xl border border-white/10 overflow-hidden hover:border-[#fdce20]/30 transition-all duration-300 group">
      {/* Image Section */}
      <div className="h-48 bg-gradient-to-br from-[#fdce20]/20 to-[#fdce20]/5 flex items-center justify-center relative overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-[#fdce20]/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-[#fdce20]/30 rounded-full"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14]/80 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-[#fdce20]/20 text-[#fdce20] rounded-full text-xs font-medium">
            {category}
          </span>
          <span className="text-xs text-gray-400">
            {getReadTime(excerpt)} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#fdce20] transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>{author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        {/* Read More Button */}
        <Link 
          href={`/blog/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fdce20] text-black font-medium rounded-lg hover:bg-[#fdce20]/90 transition-colors group"
        >
          Read Article
          <ArrowRight 
            size={16} 
            className="transform group-hover:translate-x-1 transition-transform" 
          />
        </Link>
      </div>
    </div>
  )
}
