import React from 'react'
import { Users, Star, Clock, CheckCircle } from 'lucide-react'

interface AstrologerCardProps {
  astrologer: {
    id: string
    name: string
    specialization: string
    bio: string
    rating: number
    reviews: number
    experience: string
    responseTime: string
    price: number
    image: string | null
    online: boolean
    verified: boolean
    modes: string[]
  }
}

export default function AstrologerCard({ astrologer }: AstrologerCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        astrologer.online ? 'ring-2 ring-green-400/50 shadow-green-400/20' : ''
      }`}
    >
      {/* Top Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          {/* Online/Offline Badge */}
          <div
            className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold z-10 ${
              astrologer.online
                ? "bg-green-500 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            {astrologer.online ? "Online" : "Offline"}
          </div>
          
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {astrologer.image ? (
              <img 
                src={astrologer.image} 
                alt={astrologer.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-10 h-10 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>';
                  }
                }}
              />
            ) : (
              <Users className="w-10 h-10 text-gray-400" />
            )}
          </div>
          {astrologer.online && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
          {astrologer.verified && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <CheckCircle size={14} className="text-black" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900">{astrologer.name}</h3>
          {astrologer.online && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Online Now
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{astrologer.specialization}</p>
      </div>

      {/* Middle Section */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{astrologer.rating}</span>
            <span className="text-gray-500">({astrologer.reviews})</span>
          </div>
          <div className="text-gray-500">•</div>
          <div className="text-gray-600">{astrologer.experience}</div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 text-center leading-relaxed">
          {astrologer.bio}
        </p>
        
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <Clock size={10} />
          <span>Responds {astrologer.responseTime}</span>
        </div>

        {astrologer.online && (
          <p className="text-xs text-green-600 font-medium text-center mt-2">
            Available right now
          </p>
        )}
      </div>

      {/* Action Zone */}
      <div className="space-y-4">
        {/* Primary Chat Button - Only show if chat enabled and online */}
        {astrologer.online && astrologer.modes.includes('chat') && (
          <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-lg shadow-md">
            Start Chat Now
          </button>
        )}
        
        {/* Offline Message */}
        {!astrologer.online && (
          <div className="text-center py-4 px-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-sm">Currently offline</p>
            <p className="text-gray-500 text-xs mt-1">Check back later for availability</p>
          </div>
        )}
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {astrologer.online && astrologer.modes.includes('call') && (
            <button className="py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Call
            </button>
          )}
          {astrologer.online && astrologer.modes.includes('video') && (
            <button className="py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
              Video
            </button>
          )}
        </div>
        
        {/* Price and Book */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">From</div>
            <div className="text-xl font-bold text-gray-900">${astrologer.price}/min</div>
          </div>
          <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  )
}
