'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {image && (
        <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-muted-foreground text-sm">
          {image}
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className="border-primary text-primary">
            {category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(date)}
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 text-balance">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">
          {excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            by {author}
          </span>
          <Link href={`/blog/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10 gap-2"
            >
              Read
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
