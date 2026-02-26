import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Destiny Darshan
            </h1>
            <p className="text-lg text-muted-foreground">
              Guiding you towards inner peace and holistic wellness through ancient wisdom and modern practices.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  At Destiny Darshan, we believe that true wellness comes from balancing the mind, body, and spirit. Our mission is to provide accessible, professional guidance in astrology, counselling, yoga, and meditation to help individuals navigate life's challenges and discover their true potential.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to creating a safe, judgment-free space where everyone can explore their wellness journey and find inner peace.
                </p>
              </div>
              <Card className="p-8 bg-primary/5 border-primary/20">
                <p className="text-lg font-semibold text-primary mb-4">
                  "Transform Your Life Through Wisdom and Wellness"
                </p>
                <p className="text-muted-foreground">
                  Our holistic approach combines traditional practices with contemporary understanding to help you achieve lasting wellness and fulfillment.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  title: 'Authenticity',
                  description: 'We provide genuine, evidence-based guidance from certified professionals.'
                },
                {
                  title: 'Compassion',
                  description: 'We approach every client with empathy, understanding, and non-judgment.'
                },
                {
                  title: 'Excellence',
                  description: 'We maintain the highest standards in all our services and offerings.'
                },
                {
                  title: 'Accessibility',
                  description: 'We make wellness guidance available to everyone, regardless of background.'
                }
              ].map((value) => (
                <Card key={value.title} className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Our Services
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: 'Astrology',
                  description: 'Explore your cosmic destiny through personalized astrological readings that provide insights into your life path, personality, and future possibilities.'
                },
                {
                  title: 'Counselling',
                  description: 'Work with certified counsellors to address mental health concerns, relationship challenges, and personal growth in a confidential, supportive environment.'
                },
                {
                  title: 'Yoga',
                  description: 'Join our qualified instructors for yoga sessions that strengthen your body, enhance flexibility, and create harmony between mind and physical wellness.'
                },
                {
                  title: 'Meditation',
                  description: 'Learn guided meditation techniques to calm your mind, reduce stress, and cultivate inner peace through consistent practice and expert guidance.'
                }
              ].map((service) => (
                <Card key={service.title} className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
