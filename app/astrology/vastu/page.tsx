'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Calendar, Home, Compass, Trees, Sun } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { PageHeader } from '@/components/PageHeader'

const astrologers = [
  {
    name: 'Priya Sharma',
    expertise: 'Vedic Vastu and Space Analysis',
    image: '👩‍🔬',
  },
  {
    name: 'Raj Patel',
    expertise: 'Traditional Vastu Shastra',
    image: '👨‍🔬',
  },
  {
    name: 'Meera Gupta',
    expertise: 'Modern Vastu Applications',
    image: '👩‍💼',
  },
]

const vastuTips = [
  // Entrance Category
  {
    title: 'Main Entrance',
    description: 'Ensure the main entrance faces north or east for positive energy flow. Avoid south or west entrances as they bring negative energy.',
    icon: <Home className="w-6 h-6" />,
    category: 'Entrance'
  },
  {
    title: 'Entrance Door',
    description: 'Use a solid wooden door without any cracks. The door should open clockwise and make pleasant sounds.',
    icon: <Home className="w-6 h-6" />,
    category: 'Entrance'
  },
  {
    title: 'Door Threshold',
    description: 'Keep the entrance threshold clean and elevated. Avoid broken or damaged thresholds at the entrance.',
    icon: <Home className="w-6 h-6" />,
    category: 'Entrance'
  },
  {
    title: 'Name Plate',
    description: 'Display a clear name plate near the entrance. Use metal or wooden plates with good visibility.',
    icon: <Home className="w-6 h-6" />,
    category: 'Entrance'
  },

  // Living Areas Category
  {
    title: 'Living Room',
    description: 'Place the living room in the northeast direction for harmony. Use light colors and keep the space clutter-free for positive vibes.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Living Areas'
  },
  {
    title: 'Furniture Arrangement',
    description: 'Arrange furniture in circular or square patterns. Avoid sharp edges pointing towards seating areas.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Living Areas'
  },
  {
    title: 'Seating Arrangement',
    description: 'Place sofas and chairs against south or west walls. Ensure the head of family sits facing south or west.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Living Areas'
  },
  {
    title: 'Decor Items',
    description: 'Use paintings of landscapes, waterfalls, or family photos. Avoid war scenes or abstract art with sharp angles.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Living Areas'
  },

  // Kitchen Category
  {
    title: 'Kitchen Location',
    description: 'Kitchen should be in the southeast corner for health and prosperity. Cook facing east and keep the cooking platform clean.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Kitchen'
  },
  {
    title: 'Cooking Direction',
    description: 'Always cook facing east. This brings health and prosperity to the family members.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Kitchen'
  },
  {
    title: 'Storage',
    description: 'Store food grains and utensils in south or west direction. Keep the kitchen clean and organized.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Kitchen'
  },
  {
    title: 'Water Source',
    description: 'Place water filters, purifiers, and drinking water in the northeast corner of the kitchen.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Kitchen'
  },

  // Bedrooms Category
  {
    title: 'Master Bedroom',
    description: 'Master bedroom in southwest ensures stability and peace. Sleep with head towards south for better health and relationships.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Bedrooms'
  },
  {
    title: 'Bed Position',
    description: 'Place the bed in the southwest corner of the bedroom. Avoid sleeping under beams or with head towards north.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Bedrooms'
  },
  {
    title: 'Children\'s Bedroom',
    description: 'Place children\'s bedroom in west or northwest direction. Study table should face east or north.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Bedrooms'
  },
  {
    title: 'Guest Bedroom',
    description: 'Guest bedroom should be in northwest direction. This ensures guests don\'t overstay their welcome.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Bedrooms'
  },

  // Spiritual Category
  {
    title: 'Pooja Room',
    description: 'Place pooja room in northeast corner. Face east or north while praying. Keep idols at a height and maintain cleanliness.',
    icon: <Home className="w-6 h-6" />,
    category: 'Spiritual'
  },
  {
    title: 'Idol Placement',
    description: 'Place idols at least 6 inches from walls. Ensure they are not broken or damaged in any way.',
    icon: <Home className="w-6 h-6" />,
    category: 'Spiritual'
  },
  {
    title: 'Meditation Space',
    description: 'Create a meditation area facing east or north. Use soft cushions and maintain silence in this space.',
    icon: <Home className="w-6 h-6" />,
    category: 'Spiritual'
  },
  {
    title: 'Sacred Items',
    description: 'Store religious books and items in clean, elevated places. Never keep them on the floor.',
    icon: <Home className="w-6 h-6" />,
    category: 'Spiritual'
  },

  // Study Areas Category
  {
    title: 'Study Room Location',
    description: 'Study room should be in east, north, or northeast direction. Sit facing east or north for better concentration and learning.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Study Areas'
  },
  {
    title: 'Study Table',
    description: 'Place study table against a solid wall. Ensure there is a wall behind the study chair for support.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Study Areas'
  },
  {
    title: 'Book Storage',
    description: 'Keep books in the south or west direction of the study room. Avoid clutter on the study table.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Study Areas'
  },
  {
    title: 'Lighting',
    description: 'Ensure natural light from north or east. Use bright white lights for better concentration.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Study Areas'
  },

  // Bathrooms Category
  {
    title: 'Bathroom Location',
    description: 'Bathrooms should be in northwest or southeast direction. Keep them clean and ensure proper ventilation to avoid negative energy.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Bathrooms'
  },
  {
    title: 'Toilet Position',
    description: 'Toilet seat should face north or south. Avoid facing east or west while using the toilet.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Bathrooms'
  },
  {
    title: 'Bathroom Fixtures',
    description: 'Keep bathroom fixtures clean and in working condition. Fix any leaks immediately as they drain wealth.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Bathrooms'
  },
  {
    title: 'Ventilation',
    description: 'Ensure proper cross-ventilation in bathrooms. Use exhaust fans to remove moisture and negative energy.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Bathrooms'
  },

  // Structure Category
  {
    title: 'Staircase',
    description: 'Staircase should be in south, west, or southwest direction. Avoid building it in northeast as it blocks positive energy.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Structure'
  },
  {
    title: 'Windows',
    description: 'Have more windows in north and east directions for natural light and ventilation. Keep windows clean and functional.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Structure'
  },
  {
    title: 'Doors',
    description: 'Doors should open inwards and be of even number. Avoid doors that creak or make noise.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Structure'
  },
  {
    title: 'Center of House',
    description: 'Keep the center (brahmasthan) of the house empty and clean. Avoid placing any heavy objects or structures here.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Structure'
  },
  {
    title: 'Ceiling Height',
    description: 'Maintain consistent ceiling height throughout the house. Avoid sloping ceilings in living areas.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Structure'
  },
  {
    title: 'Beams',
    description: 'Avoid sleeping or sitting directly under beams. If unavoidable, use a false ceiling or beam concealer.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Structure'
  },

  // Decor Category
  {
    title: 'Wall Colors',
    description: 'Use light colors like white, cream, light blue for walls. Avoid dark colors in bedrooms and use red sparingly in living areas.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Decor'
  },
  {
    title: 'Mirrors',
    description: 'Place mirrors on north or east walls. Avoid mirrors in bedrooms and ensure they don\'t reflect the main entrance.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Decor'
  },
  {
    title: 'Paintings',
    description: 'Hang paintings of positive scenes like nature, waterfalls, or family photos. Avoid paintings depicting violence or sadness.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Decor'
  },
  {
    title: 'Curtains',
    description: 'Use light-colored curtains in north and east directions. Use dark colors in south and west.',
    icon: <Compass className="w-6 h-6" />,
    category: 'Decor'
  },

  // Nature Category
  {
    title: 'Indoor Plants',
    description: 'Place money plants, bamboo, and tulsi in northeast direction. Avoid cactus and thorny plants inside the house.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Nature'
  },
  {
    title: 'Garden',
    description: 'Create a garden in the north or east direction. Plant flowering plants and avoid large trees near the house.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Nature'
  },
  {
    title: 'Water Features',
    description: 'Place water fountains or aquariums in northeast direction. Ensure water flows continuously.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Nature'
  },
  {
    title: 'Rock Garden',
    description: 'Create rock gardens in southwest direction. Avoid rocks in northeast as they block positive energy.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Nature'
  },

  // Utilities Category
  {
    title: 'Water Storage',
    description: 'Overhead water tanks should be in southwest direction. Underground water tanks are ideal in northeast direction.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Utilities'
  },
  {
    title: 'Electrical Items',
    description: 'Place electrical appliances in southeast direction. Avoid keeping them in northeast as they create electromagnetic disturbances.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Utilities'
  },
  {
    title: 'Gas Cylinders',
    description: 'Store empty gas cylinders in south direction and filled cylinders in east direction.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Utilities'
  },
  {
    title: 'Waste Disposal',
    description: 'Designate waste disposal areas in northwest direction. Keep waste bins covered and clean.',
    icon: <Sun className="w-6 h-6" />,
    category: 'Utilities'
  },

  // Furniture Category
  {
    title: 'Heavy Furniture',
    description: 'Place heavy furniture and almirahs in south or west direction. Keep southwest corners heavy for stability.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Furniture'
  },
  {
    title: 'Sofa Sets',
    description: 'Place sofa sets against west or south walls. Ensure they don\'t block the flow of movement.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Furniture'
  },
  {
    title: 'Dining Table',
    description: 'Place dining table in west or north direction. Ensure square or rectangular shape for family harmony.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Furniture'
  },
  {
    title: 'Wardrobes',
    description: 'Place wardrobes in southwest direction. Keep doors opening towards east or north for positive energy.',
    icon: <Trees className="w-6 h-6" />,
    category: 'Furniture'
  }
]

export default function VastuPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedAstrologer, setSelectedAstrologer] = useState(astrologers[0])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const handleBookConsultation = (astrologer: typeof astrologers[0]) => {
    setSelectedAstrologer(astrologer)
    setIsBookingOpen(true)
  }

  const categories = ['All', ...Array.from(new Set(vastuTips.map(tip => tip.category)))]

  const filteredTips = vastuTips.filter(tip => 
    selectedCategory === 'All' || tip.category === selectedCategory
  )

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 pb-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
              <Home className="w-4 h-4" />
              Vastu Shastra Consultation
            </div>
            
            
            
            
          </div>
        </div>
      </section>

      {/* Vastu Tips Section */}
      <section className="pb-8 lg:pb-16 px-4 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Essential Vastu Tips
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Key principles to create harmony and positive energy in your living space
            </p>
          </div>
          <div className="flex justify-center mb-8 lg:mb-12">
            <div className="w-full max-w-md">
              <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-[#0f172a]">
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black mb-4">
                  {tip.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{tip.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">{tip.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                    {tip.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No tips found for the selected category.</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {vastuTips.length}
              </div>
              <p className="text-white/70 text-sm">Total Tips</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {categories.length - 1}
              </div>
              <p className="text-white/70 text-sm">Categories</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {Math.round(vastuTips.length / (categories.length - 1))}
              </div>
              <p className="text-white/70 text-sm">Avg Tips per Category</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vastu Experts Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Vastu Specialists
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Expert consultants to guide you in creating harmonious living spaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {astrologers.map((astrologer, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl shadow-black/40 hover:bg-white/10 transition-all duration-300">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-4xl mx-auto mb-4">
                      {astrologer.image}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{astrologer.name}</h3>
                    <p className="text-white/70 text-sm">{astrologer.expertise}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleBookConsultation(astrologer)}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Consult Now
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-3xl p-8 lg:p-12 border border-yellow-400/20">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Transform Your Space Today
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Get personalized Vastu consultation and create a harmonious environment that attracts success and happiness.
            </p>
            <Button
              onClick={() => handleBookConsultation(astrologers[0])}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Start Your Vastu Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Footer */}
      <Footer />

      {/* Simple Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Book Vastu Consultation</h3>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl mx-auto mb-2">
                {selectedAstrologer.image}
              </div>
              <h4 className="text-lg font-semibold text-white">{selectedAstrologer.name}</h4>
              <p className="text-white/70 text-sm">{selectedAstrologer.expertise}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsBookingOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Link href="/astrology" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600">
                  Proceed to Booking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
