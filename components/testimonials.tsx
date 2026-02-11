'use client'

import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface Testimonial {
  id: string
  name: string
  initials: string
  service: string
  benefit: string
  rating: number
}

interface TestimonialsProps {
  testimonials?: Testimonial[]
  title?: string
  description?: string
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    initials: 'SJ',
    service: 'Meditation',
    benefit:
      'Meditation sessions helped me find inner peace and manage my anxiety. I feel more grounded and focused every day.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Ravi Kumar',
    initials: 'RK',
    service: 'Astrology',
    benefit:
      'The astrology consultation provided clarity about my career path. The insights were accurate and transformative.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emma Chen',
    initials: 'EC',
    service: 'Yoga',
    benefit:
      'Regular yoga practice improved my flexibility and strength. I feel healthier and more connected to my body.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Michael Singh',
    initials: 'MS',
    service: 'Counselling',
    benefit:
      'The counselling sessions gave me tools to navigate life challenges. My therapist was incredibly supportive.',
    rating: 5,
  },
]

export function Testimonials({ 
  testimonials = defaultTestimonials,
  title = 'What Our Clients Say',
  description = 'Join thousands of people who have transformed their lives through our wellness services.',
}: TestimonialsProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section 
      ref={ref}
      className="py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-12 ${isVisible ? 'animate-scroll-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`p-6 flex flex-col border-accent/20 hover:border-accent/50 transition-colors ${
                isVisible ? `animate-scroll-fade-in scroll-animate-stagger-${Math.min((index % 4) + 1, 4)}` : 'opacity-0'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {testimonial.initials}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.service}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-accent text-accent"
                  />
                ))}
              </div>

              <p className="text-foreground text-sm leading-relaxed flex-1">
                {testimonial.benefit}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
