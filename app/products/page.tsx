'use client'

import React, { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Filter, SortAsc } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category?: string
}

const products: Product[] = [
  {
    id: 'rudraksha-mala',
    name: 'Rudraksha Mala',
    description: 'Authentic 5-faced Rudraksha mala for spiritual protection and meditation. Helps in maintaining peace and harmony.',
    price: 1299,
    image: '/images/products/rudraksha-mala.jpg',
    category: 'Spiritual'
  },
  {
    id: 'healing-crystals-kit',
    name: 'Healing Crystals Kit',
    description: 'Complete set of 7 chakra healing crystals with guidebook. Perfect for energy balancing and meditation practices.',
    price: 2499,
    image: '/images/products/healing-crystals-kit.jpg',
    category: 'Spiritual'
  },
  {
    id: 'chakra-balancing-incense',
    name: 'Chakra Balancing Incense',
    description: 'Handcrafted natural incense sticks for chakra alignment. Includes 7 fragrances for each energy center.',
    price: 599,
    image: '/images/products/chakra-incense.jpg',
    category: 'Meditation'
  },
  {
    id: 'meditation-cushion',
    name: 'Meditation Cushion',
    description: 'Ergonomic meditation cushion with buckwheat filling. Provides comfortable support for extended meditation sessions.',
    price: 1899,
    image: '/images/products/meditation-cushion.jpg',
    category: 'Meditation'
  },
  {
    id: 'spiritual-journal',
    name: 'Spiritual Journal',
    description: 'Guided journal for self-reflection and spiritual growth. Includes prompts and exercises for inner exploration.',
    price: 799,
    image: '/images/products/spiritual-journal.jpg',
    category: 'Spiritual'
  },
  {
    id: 'astrology-consultation-kit',
    name: 'Astrology Consultation Kit',
    description: 'Complete kit for astrology consultation including birth chart analysis and personalized remedies.',
    price: 3499,
    image: '/images/products/astrology-kit.jpg',
    category: 'Astrology'
  }
]

const categories = ['All', 'Spiritual', 'Meditation', 'Astrology']

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<'default' | 'price-low-high' | 'price-high-low'>('default')

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'All') return true
    return product.category === selectedCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low-high') return a.price - b.price
    if (sortBy === 'price-high-low') return b.price - a.price
    return 0
  })

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSortChange = () => {
    if (sortBy === 'default') setSortBy('price-low-high')
    else if (sortBy === 'price-low-high') setSortBy('price-high-low')
    else setSortBy('default')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Spiritual Wellness Products
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover carefully selected products to enhance your spiritual journey, meditation practice, and overall well-being.
            </p>
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleSortChange}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <SortAsc className="w-4 h-4 mr-2" />
                {sortBy === 'default' ? 'Sort' : sortBy === 'price-low-high' ? 'Price: Low to High' : 'Price: High to Low'}
              </Button>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No products found in {selectedCategory} category.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need Personalized Recommendations?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our experts can help you choose the perfect products based on your spiritual needs and wellness goals.
            </p>
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
            >
              <a href="/contact" className="inline-flex items-center">
                Get Personalized Guidance
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
