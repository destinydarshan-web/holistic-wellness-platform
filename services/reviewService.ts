import { supabase } from '@/lib/supabaseClient'
import { Review, ReviewForm, ReviewStats, ReviewFilter, validateReviewForm } from '@/lib/reviews'

export class ReviewService {
  // Create a new review
  static async createReview(reviewData: ReviewForm & { user_id: string; expert_id: string; appointment_id?: string }): Promise<{ data?: Review; error?: any }> {
    try {
      const validation = validateReviewForm(reviewData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          user_id: reviewData.user_id,
          expert_id: reviewData.expert_id,
          appointment_id: reviewData.appointment_id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          apt: reviewData.apt,
          created_at: new Date().toISOString(),
          helpful_count: 0
        }])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Update an existing review
  static async updateReview(id: string, updateData: Partial<ReviewForm>): Promise<{ data?: Review; error?: any }> {
    try {
      const validation = validateReviewForm(updateData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: updateData.rating,
          comment: updateData.comment,
          apt: updateData.apt,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Delete a review
  static async deleteReview(id: string): Promise<{ error?: any }> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Get reviews by expert ID
  static async getExpertReviews(expertId: string, limit?: number): Promise<{ data?: Review[]; error?: any }> {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      return { data: data || [], error }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Get reviews by user ID
  static async getUserReviews(userId: string, limit?: number): Promise<{ data?: Review[]; error?: any }> {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      return { data: data || [], error }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Get review statistics for an expert
  static async getReviewStats(expertId: string): Promise<{ data?: ReviewStats; error?: any }> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('expert_id', expertId)

      if (error) {
        return { error, data: undefined }
      }

      if (!reviews || reviews.length === 0) {
        return { 
          data: {
            average_rating: 0,
            total_reviews: 0,
            total_helpful: 0
          }, 
          error: undefined 
        }
      }

      const totalReviews = reviews.length
      const sumRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = sumRating / totalReviews

      return { 
        data: {
          average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          total_reviews: totalReviews,
          total_helpful: 0 // Would need separate query for helpful counts
        }, 
        error: undefined 
      }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Mark a review as helpful
  static async markHelpful(reviewId: string): Promise<{ error?: any }> {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          helpful_count: supabase.rpc('increment', { count: 1 }) 
        })
        .eq('id', reviewId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Get reviews with filtering
  static async getReviews(filter: ReviewFilter, limit?: number): Promise<{ data?: Review[]; error?: any }> {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filter.expert_id) {
        query = query.eq('expert_id', filter.expert_id)
      }
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id)
      }
      if (filter.rating) {
        query = query.eq('rating', filter.rating)
      }
      if (filter.date_from) {
        query = query.gte('created_at', filter.date_from)
      }
      if (filter.date_to) {
        query = query.lte('created_at', filter.date_to)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      return { data: data || [], error }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Get a single review by ID
  static async getReviewById(id: string): Promise<{ data?: Review; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      return { error, data: undefined }
    }
  }

  // Search reviews
  static async searchReviews(searchTerm: string, limit: number = 10): Promise<{ data?: Review[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .or(`comment.ilike.%${searchTerm}%,expert_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      return { data: data || [], error }
    } catch (error) {
      return { error, data: undefined }
    }
  }
}

// Export a singleton instance for convenience
export const reviewService = new ReviewService()
