import Link from 'next/link'
import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1f1f1f] text-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold tracking-wide text-white mb-4">Destiny Darshan</h3>
            <p className="text-sm text-neutral-400">
              Balance your mind, body and soul.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold tracking-wide text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-neutral-300 hover:text-[#fbcc1e] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-300 hover:text-[#fbcc1e] transition-colors duration-200 hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-[#fbcc1e] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold tracking-wide text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-neutral-300 hover:text-[#fbcc1e] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-300 hover:text-[#fbcc1e] transition-colors duration-200 hover:translate-x-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold tracking-wide text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/destinydarshan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-[#fbcc1e] hover:text-black transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://facebook.com/destinydarshan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-[#fbcc1e] hover:text-black transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="https://youtube.com/@destinydarshan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-[#fbcc1e] hover:text-black transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>

              <a
                href="https://wa.me/9038984582"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-[#fbcc1e] hover:text-black transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-neutral-700 my-10 pt-6 text-center">
          <p className="text-sm text-neutral-400">
            &copy; {currentYear} Destiny Darshan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
