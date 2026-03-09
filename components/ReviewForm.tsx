'use client'

import { useState } from 'react'
import { Star, X, Check } from 'lucide-react'
import { ReviewForm as IReviewForm, Review, validateReviewForm } from '@/lib/reviews'

interface ReviewFormProps {
  appointment?: any
  onSubmit: (reviewData: IReviewForm) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  initialData?: Partial<IReviewForm>
}

export default function ReviewForm({ 
  appointment, 
  onSubmit, 
  onCancel, 
  isSubmitting = false, 
  initialData = {} 
}: ReviewFormProps) {
  const [formData, setFormData] = useState<IReviewForm>({
    rating: 5,
    comment: '',
    apt: 'consultation',
    ...initialData
  })
  
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateReviewForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setErrors([])
    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof IReviewForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors for this field when user starts typing
    if (errors.length > 0) {
      setErrors(prev => prev.filter(error => !error.includes(field)))
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            className={`p-1 rounded-full transition-all ${
              formData.rating >= star 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
            disabled={isSubmitting}
          >
            <Star className={`w-5 h-5 ${formData.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {appointment ? 'Rate Your Experience' : 'Leave a Review'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {appointment && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Service:</strong> {appointment.service || 'Consultation'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Expert:</strong> {appointment.expert_name || 'Expert'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Date:</strong> {new Date(appointment.date || '').toLocaleDateString()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          {renderStars()}
          {errors.some(error => error.includes('rating')) && (
            <p className="text-red-500 text-sm mt-1">
              Please select a rating
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appointment Type *
          </label>
          <select
            value={formData.apt}
            onChange={(e) => handleInputChange('apt', e.target.value as string)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="consultation">Consultation</option>
            <option value="reading">Reading</option>
            <option value="counselling">Counselling</option>
            <option value="meditation">Meditation</option>
            <option value="yoga">Yoga</option>
          </select>
          {errors.some(error => error.includes('apt')) && (
            <p className="text-red-500 text-sm mt-1">
              Please select an appointment type
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          {errors.some(error => error.includes('comment')) && (
            <p className="text-red-500 text-sm mt-1">
              Comment must be at least 10 characters
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent border-r-transparent animate-spin rounded-full"></div>
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit Review
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
