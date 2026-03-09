// Review types and interfaces for the review system

export interface Review {
  id: string
  user_id: string
  expert_id: string
  appointment_id?: string
  rating: number
  comment: string
  apt?: string
  created_at: string
  updated_at?: string
  helpful_count: number
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  total_helpful: number
}

export interface ReviewForm {
  rating: number
  comment: string
  apt: string
}

export interface ReviewFilter {
  expert_id?: string
  user_id?: string
  rating?: number
  date_from?: string
  date_to?: string
}

export interface ReviewResponse {
  data: Review[]
  error: any
  message?: string
}

export interface ReviewStatsResponse {
  data: ReviewStats | null
  error: any
  message?: string
}

// Review validation functions
export const validateReviewForm = (review: Partial<ReviewForm>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.push('Rating must be between 1 and 5')
  }
  
  if (!review.comment || review.comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters')
  }
  
  if (!review.apt || review.apt.trim().length < 3) {
    errors.push('Appointment type must be at least 3 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Review formatting functions
export const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatRating = (rating: number): string => {
  const stars = '⭐'.repeat(Math.floor(rating))
  const halfStar = rating % 1 >= 0.5 ? '⭐' : ''
  return stars + halfStar
}

// Review calculation functions
export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}

export const getRatingDistribution = (reviews: Review[]): { [key: number]: number } => {
  const distribution: { [key: number]: number } = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  }
  
  reviews.forEach(review => {
    const rating = Math.floor(review.rating)
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++
    }
  })
  
  return distribution
}
