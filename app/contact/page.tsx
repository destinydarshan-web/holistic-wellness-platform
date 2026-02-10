import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Mail, Phone, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Get In Touch
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Have questions or want to know more about our services? We'd love to hear from you.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Email
              </h3>
              <p className="text-muted-foreground">
                <a href="mailto:destinydarshan@gmail.com" className="hover:text-primary transition-colors">
                  destinydarshan@gmail.com
                </a>
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Phone className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Phone
              </h3>
              <p className="text-muted-foreground">
                <a href="tel:+911234567890" className="hover:text-primary transition-colors">
                  +91 12345 67890
                </a>
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                WhatsApp
              </h3>
              <p className="text-muted-foreground">
                <a 
                  href="https://wa.me/911234567890" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  +91 12345 67890
                </a>
              </p>
            </Card>
          </div>

          <Card className="p-8 bg-muted/50">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Response Time
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We typically respond to all inquiries within 24-48 hours. For urgent matters, please use our WhatsApp contact option for faster communication.
            </p>
          </Card>

          <div className="mt-12 bg-primary/5 p-8 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Want to Share Your Concern?
            </h2>
            <p className="text-muted-foreground mb-6">
              Use our AI-powered form on the homepage to describe your wellness concern and get a personalized service recommendation.
            </p>
            <a 
              href="/" 
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Concern Form
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
