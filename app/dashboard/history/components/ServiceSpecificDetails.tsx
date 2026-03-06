'use client'

import { Star, MessageCircle, Users, Sparkles, Heart, Brain, Activity, Target, TrendingUp, Award, Calendar, Clock, MapPin } from 'lucide-react'

interface ServiceSpecificDetailsProps {
  service: {
    category: string
    mode: string
    duration?: number
  }
  sessionData?: any
}

export default function ServiceSpecificDetails({ service, sessionData }: ServiceSpecificDetailsProps) {
  const renderAstrologyDetails = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-purple-600" />
          <h4 className="font-semibold text-purple-900">Astrology Session Details</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Zodiac Focus</p>
              <p className="font-medium text-purple-900">{sessionData?.zodiac_sign || 'General Reading'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Life Area</p>
              <p className="font-medium text-purple-900">{sessionData?.life_area || 'Comprehensive'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Prediction Type</p>
              <p className="font-medium text-purple-900">{sessionData?.prediction_type || 'Birth Chart'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Remedies Given</p>
              <p className="font-medium text-purple-900">{sessionData?.remedies ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
        
        {sessionData?.key_insights && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-sm font-medium text-purple-900 mb-2">Key Insights</p>
            <p className="text-sm text-purple-700">{sessionData.key_insights}</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderCounsellingDetails = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Counselling Session Details</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Focus Area</p>
              <p className="font-medium text-blue-900">{sessionData?.focus_area || 'General Wellness'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Therapy Type</p>
              <p className="font-medium text-blue-900">{sessionData?.therapy_type || 'Cognitive Behavioral'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Session Goal</p>
              <p className="font-medium text-blue-900">{sessionData?.session_goal || 'Emotional Support'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Progress Made</p>
              <p className="font-medium text-blue-900">{sessionData?.progress || 'Initial Assessment'}</p>
            </div>
          </div>
        </div>
        
        {sessionData?.recommendations && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Recommendations</p>
            <p className="text-sm text-blue-700">{sessionData.recommendations}</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderYogaDetails = () => (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-green-600" />
          <h4 className="font-semibold text-green-900">Yoga Session Details</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Yoga Style</p>
              <p className="font-medium text-green-900">{sessionData?.yoga_style || 'Hatha Yoga'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Focus Area</p>
              <p className="font-medium text-green-900">{sessionData?.focus_area || 'Flexibility'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Intensity Level</p>
              <p className="font-medium text-green-900">{sessionData?.intensity || 'Beginner'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Equipment Used</p>
              <p className="font-medium text-green-900">{sessionData?.equipment || 'Mat Only'}</p>
            </div>
          </div>
        </div>
        
        {sessionData?.poses_practiced && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm font-medium text-green-900 mb-2">Key Poses Practiced</p>
            <div className="flex flex-wrap gap-2">
              {sessionData.poses_practiced.split(',').map((pose: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {pose.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {sessionData?.breathing_techniques && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm font-medium text-green-900 mb-2">Breathing Techniques</p>
            <p className="text-sm text-green-700">{sessionData.breathing_techniques}</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderMeditationDetails = () => (
    <div className="space-y-4">
      <div className="bg-indigo-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h4 className="font-semibold text-indigo-900">Meditation Session Details</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-600">Meditation Type</p>
              <p className="font-medium text-indigo-900">{sessionData?.meditation_type || 'Mindfulness'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-600">Goal</p>
              <p className="font-medium text-indigo-900">{sessionData?.goal || 'Stress Relief'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-600">Experience Level</p>
              <p className="font-medium text-indigo-900">{sessionData?.experience_level || 'Beginner'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-600">Environment</p>
              <p className="font-medium text-indigo-900">{sessionData?.environment || 'Guided'}</p>
            </div>
          </div>
        </div>
        
        {sessionData?.techniques_used && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <p className="text-sm font-medium text-indigo-900 mb-2">Techniques Used</p>
            <div className="flex flex-wrap gap-2">
              {sessionData.techniques_used.split(',').map((technique: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  {technique.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {sessionData?.mindfulness_exercises && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <p className="text-sm font-medium text-indigo-900 mb-2">Mindfulness Exercises</p>
            <p className="text-sm text-indigo-700">{sessionData.mindfulness_exercises}</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderServiceDetails = () => {
    switch (service.category) {
      case 'astrology':
        return renderAstrologyDetails()
      case 'counselling':
        return renderCounsellingDetails()
      case 'yoga':
        return renderYogaDetails()
      case 'meditation':
        return renderMeditationDetails()
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {renderServiceDetails()}
      
      {/* Common Session Details */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Session Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium text-gray-900">{service.duration || 60} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Mode</p>
              <p className="font-medium text-gray-900 capitalize">{service.mode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
