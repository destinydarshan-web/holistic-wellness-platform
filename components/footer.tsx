import Link from 'next/link'
import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Destiny Darshan</h3>
            <p className="text-sm opacity-90">
              Discover inner peace and wellness through astrology, counselling,
              yoga, and meditation.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
<div>
  <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
  <div className="flex gap-4">
    <a
      href="https://instagram.com/destinydarshan"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      >
      <Instagram className="h-5 w-5 text-pink-500" />
    </a>

    <a
      href="https://facebook.com/destinydarshan"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
      >
      <Facebook className="h-5 w-5 text-blue-500" />
    </a>

    <a
      href="https://youtube.com/@destinydarshan"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="YouTube"
      >
      <Youtube className="h-5 w-5 text-red-500" />
    </a>

    <a
      href="https://wa.me/9038984582"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      >
      <MessageCircle className="h-5 w-5 text-green-500" />
    </a>
  </div>
</div>

        </div>

        <div className="border-t border-primary-foreground border-opacity-20 pt-8 text-center text-sm opacity-90">
          <p>&copy; {currentYear} Destiny Darshan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
