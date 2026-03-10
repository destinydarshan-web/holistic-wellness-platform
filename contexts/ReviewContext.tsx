'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/lib/supabaseClient'

// Define types locally since the lib file doesn't exist
interface Review {
  id: string
  user_id: string
  expert_id: string
  appointment_id: string
  rating: number
  comment: string
  created_at: string
  helpful_count: number
}

interface ReviewStats {
  average_rating: number
  total_reviews: number
  total_helpful: number
}

interface ReviewForm {
  rating: number
  comment: string
  apt: string
}

interface ReviewContextType {
  reviews: Review[]
  expertReviews: Review[]
  userReviews: Review[]
  reviewStats: ReviewStats | null
  isLoading: boolean
  createReview: (review: ReviewForm) => Promise<void>
  updateReview: (id: string, review: Partial<ReviewForm>) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  markHelpful: (reviewId: string) => Promise<void>
  getExpertReviews: (expertId: string) => Promise<void>
  getUserReviews: (userId: string) => Promise<void>
  getReviewStats: (expertId: string) => Promise<void>
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

export function useReview() {
  const context = useContext(ReviewContext)
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider')
  }
  return context
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [expertReviews, setExpertReviews] = useState<Review[]>([])
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const createReview = async (reviewData: ReviewForm): Promise<void> => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          apt: reviewData.apt,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      if (data) {
        setReviews(prev => [...prev, data])
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const updateReview = async (id: string, reviewData: Partial<ReviewForm>): Promise<void> => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: reviewData.rating,
          comment: reviewData.comment,
          apt: reviewData.apt,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      
      setReviews(prev => 
        prev.map(review => 
          review.id === id 
            ? { ...review, ...reviewData }
            : review
        )
      )
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReview = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setReviews(prev => prev.filter(review => review.id !== id))
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const markHelpful = async (reviewId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: supabase.rpc('increment', { count: 1 }) })
        .eq('id', reviewId)
        .select()

      if (error) throw error
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const getExpertReviews = async (expertId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setExpertReviews(data)
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const getUserReviews = async (userId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        setUserReviews(data)
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const getReviewStats = async (expertId: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('expert_id', expertId)

      if (error) throw error
      
      if (data && data.length > 0) {
        const sum = data.reduce((acc: number, review: any) => acc + review.rating, 0)
        const average = sum / data.length
        const total = data.length
        
        setReviewStats({
          average_rating: average,
          total_reviews: total,
          total_helpful: 0 // Would need separate query for helpful counts
        })
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false)
    }
  }

  const value: ReviewContextType = {
    reviews,
    expertReviews,
    userReviews,
    reviewStats,
    isLoading,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getExpertReviews,
    getUserReviews,
    getReviewStats
  }

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}
