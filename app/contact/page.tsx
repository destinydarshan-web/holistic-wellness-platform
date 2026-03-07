import { Navigation } from '@/components/navigation'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MessageCircle, MapPin, Clock, Sparkles, ArrowRight, Send } from 'lucide-react'

export default function ContactPage() {
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
            <span className="text-[#d8b4fe] font-medium">Get In Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            <span className="text-[#fdce20]">
              Contact Us
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Have questions or want to know more about our services? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <a 
              href="mailto:destinydarshan@gmail.com?subject=Inquiry from Destiny Darshan Website&body=Hi, I would like to know more about your services."
              className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#fdce20]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#fdce20]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Email
              </h3>
              <p className="text-white/70 mb-4">
                destinydarshan@gmail.com
              </p>
              <div className="flex items-center justify-center text-[#fdce20] group-hover:text-white transition-colors">
                <span className="text-sm font-medium">Send Email</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a 
              href="tel:+919038984582"
              className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#d8b4fe]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#d8b4fe]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Phone
              </h3>
              <p className="text-white/70 mb-4">
                +91 9038984582
              </p>
              <div className="flex items-center justify-center text-[#d8b4fe] group-hover:text-white transition-colors">
                <span className="text-sm font-medium">Call Now</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a 
              href="https://wa.me/919038984582?text=Hi! I'm interested in your services. Can you provide more information?"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-[#fdce20]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-[#fdce20]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                WhatsApp
              </h3>
              <p className="text-white/70 mb-4">
                +91 9038984582
              </p>
              <div className="flex items-center justify-center text-[#fdce20] group-hover:text-white transition-colors">
                <span className="text-sm font-medium">Chat on WhatsApp</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>

          {/* Team Message */}
          <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Team of Experts Are Waiting to Hear From You
            </h2>
            <p className="text-white/80 leading-relaxed">
              We typically respond to all inquiries within 24-48 hours. For urgent matters, please use our WhatsApp contact option for faster communication.
            </p>
          </div>

          {/* Office Hours */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#d8b4fe]/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#d8b4fe]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Office Hours
                </h3>
              </div>
              <div className="space-y-2 text-white/70">
                <p>Open 24*7</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#fdce20]/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#fdce20]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Location
                </h3>
              </div>
              <div className="space-y-2 text-white/70">
                <p>Destiny Darshan Wellness Center</p>
                <p>123 Spiritual Path, Inner Peace City</p>
                <p>Karnataka, India - 560001</p>
              </div>
            </div>
          </div>

          {/* AI Form CTA */}
          <div className="bg-[#d8b4fe]/20 backdrop-blur-sm border border-[#d8b4fe]/30 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to Share Your Concern?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Use our AI-powered form on the homepage to describe your wellness concern and get a personalized service recommendation.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#fdce20] text-black font-semibold rounded-xl hover:bg-[#d8b4fe] transition-all duration-300 transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
              Go to Concern Form
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
