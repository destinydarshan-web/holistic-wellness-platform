import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, Calendar, Users, Award, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { RegisterButton } from '@/components/register-button'
import { yogaEvents } from '@/lib/yogaEvents'

export default async function YogaEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Find event by slug
  const event = yogaEvents.find(e => e.slug === slug)
  
  if (!event) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-3xl font-semibold">Event Not Found</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader title={event.title} />

        {/* Event Summary Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column - Event Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h2 className="text-4xl font-bold text-foreground mb-6">{event.title}</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium text-foreground">{event.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium text-foreground">{event.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Venue</p>
                        <p className="font-medium text-foreground">{event.venue}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trainer</p>
                        <p className="font-medium text-foreground">{event.trainer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">LEVEL</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Session Type</p>
                        <p className="font-medium text-foreground">{event.level}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-foreground leading-relaxed mt-4">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Right Column - Sticky Info Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Card className="bg-card rounded-xl p-6 shadow-md border border-border">
                    <div className="text-center space-y-4">
                      <div>
                        <p className="text-3xl font-bold text-accent">{event.price}</p>
                        <p className="text-sm text-muted-foreground">per session</p>
                      </div>
                      
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                        <p className="text-lg font-bold text-accent">12</p>
                        <p className="text-sm text-muted-foreground">spots remaining</p>
                      </div>
                      
                      <RegisterButton 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg w-full py-3 shadow-sm hover:opacity-90 transition"
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event Gallery Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8">Event Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-foreground mb-6">Benefits</h3>
              <ul className="space-y-3">
                {event.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-foreground text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Trainer Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{event.trainer}</h3>
                  <p className="text-accent font-medium mb-3">Experienced Yoga Instructor</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Certified professional with expertise in {event.level.toLowerCase()} yoga practices and personalized guidance.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg md:hidden">
          <div className="max-w-md mx-auto">
            <RegisterButton 
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg w-full py-3 shadow-sm hover:opacity-90 transition"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
