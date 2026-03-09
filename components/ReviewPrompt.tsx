'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { reviewService } from '@/services/reviewService'
import { ReviewForm } from '@/components/ReviewForm'

interface Appointment {
  id: string
  date: string
  time: string
  expert_name: string
  expert_id: string
  service: string
  status: string
}

interface ReviewPromptProps {
  appointment: Appointment
  onReviewSubmitted?: () => void
}

export default function ReviewPrompt({ appointment, onReviewSubmitted }: ReviewPromptProps) {
  const { user } = useAuth()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReviewSubmit = async (reviewData: any) => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      await reviewService.submitReview({
        appointment_id: appointment.id,
        user_id: user.id,
        expert_id: appointment.expert_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        apt: reviewData.apt
      })
      
      setShowReviewForm(false)
      onReviewSubmitted?.()
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showReviewForm) {
    return (
      <ReviewForm
        appointment={appointment}
        onSubmit={handleReviewSubmit}
        onCancel={() => setShowReviewForm(false)}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Rate Your Experience</h3>
        <p className="text-gray-600 mb-4">
          How was your {appointment.service} with {appointment.expert_name}?
        </p>
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Leave a Review
        </button>
      </div>
    </div>
  )
}
