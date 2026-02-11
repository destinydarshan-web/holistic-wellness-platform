'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  category?: string
}

export function ProductCard({ id, name, description, price, image, category }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {category && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground line-clamp-1">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold text-primary">
            {formatPrice(price)}
          </div>
          
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            asChild
          >
            <a href={`/products/${id}`}>
              View Details
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
