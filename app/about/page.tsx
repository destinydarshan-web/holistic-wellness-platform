import { Navigation } from '@/components/navigation'
import { Card } from '@/components/ui/card'
import { Sparkles, Heart, Star, Users, Shield, Lightbulb, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#fdce20]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#d8b4fe]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-[#fdce20]/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-[#fdce20]" />
            <span className="text-[#d8b4fe] font-medium">Welcome to</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            <span className="text-[#fdce20]">
              About Destiny Darshan
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Guiding you towards inner peace and holistic wellness through ancient wisdom and modern practices.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our <span className="text-[#fdce20]">Mission</span>
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                At Destiny Darshan, we believe that true wellness comes from balancing the mind, body, and spirit. Our mission is to provide accessible, professional guidance in astrology, counselling, yoga, and meditation to help individuals navigate life's challenges and discover their true potential.
              </p>
              <p className="text-white/70 leading-relaxed">
                We are committed to creating a safe, judgment-free space where everyone can explore their wellness journey and find inner peace.
              </p>
            </div>
            <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-2xl p-8">
              <p className="text-xl font-semibold text-white mb-4">
                "Transform Your Life Through Wisdom and Wellness"
              </p>
              <p className="text-white/70">
                Our holistic approach combines traditional practices with contemporary understanding to help you achieve lasting wellness and fulfillment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Our Core <span className="text-[#d8b4fe]">Values</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Authenticity',
                description: 'We provide genuine, evidence-based guidance from certified professionals.',
                icon: <Shield className="w-6 h-6" />
              },
              {
                title: 'Compassion',
                description: 'We approach every client with empathy, understanding, and non-judgment.',
                icon: <Heart className="w-6 h-6" />
              },
              {
                title: 'Excellence',
                description: 'We maintain the highest standards in all our services and offerings.',
                icon: <Star className="w-6 h-6" />
              },
              {
                title: 'Accessibility',
                description: 'We make wellness guidance available to everyone, regardless of background.',
                icon: <Users className="w-6 h-6" />
              }
            ].map((value) => (
              <div key={value.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-[#fdce20]/20 rounded-xl flex items-center justify-center text-[#fdce20] mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Our <span className="text-[#fdce20]">Services</span>
          </h2>
          <div className="space-y-6">
            {[
              {
                title: 'Astrology',
                description: 'Explore your cosmic destiny through personalized astrological readings that provide insights into your life path, personality, and future possibilities.',
                icon: <Star className="w-8 h-8" />,
                color: '[#fdce20]'
              },
              {
                title: 'Counselling',
                description: 'Work with certified counsellors to address mental health concerns, relationship challenges, and personal growth in a confidential, supportive environment.',
                icon: <Heart className="w-8 h-8" />,
                color: '[#d8b4fe]'
              },
              {
                title: 'Yoga',
                description: 'Join our qualified instructors for yoga sessions that strengthen your body, enhance flexibility, and create harmony between mind and physical wellness.',
                icon: <Users className="w-8 h-8" />,
                color: '[#fdce20]'
              },
              {
                title: 'Meditation',
                description: 'Learn guided meditation techniques to calm your mind, reduce stress, and cultivate inner peace through consistent practice and expert guidance.',
                icon: <Lightbulb className="w-8 h-8" />,
                color: '[#d8b4fe]'
              }
            ].map((service) => (
              <div key={service.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-${service.color}/20 rounded-xl flex items-center justify-center flex-shrink-0 text-${service.color}`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-[#fdce20] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-white/40 group-hover:text-[#fdce20] transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Begin Your Wellness Journey
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands who have transformed their lives through our holistic approach to wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-[#fdce20] text-black font-semibold rounded-xl hover:bg-[#d8b4fe] transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
