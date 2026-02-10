import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ServiceCTALinkProps {
  serviceName: string
  serviceHref: string
}

export function ServiceCTALink({ serviceName, serviceHref }: ServiceCTALinkProps) {
  return (
    <Link
      href={serviceHref}
      className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent/80 transition-colors group"
    >
      <span>Explore our {serviceName} services</span>
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  )
}
