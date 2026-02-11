'use client'

import { Button } from '@/components/ui/button'

interface RegisterButtonProps {
  className?: string
}

export function RegisterButton({ className }: RegisterButtonProps) {
  const handleClick = () => {
    alert("Registration feature coming soon!")
  }

  return (
    <Button 
      size="lg"
      onClick={handleClick}
      className={className}
    >
      Register Now
    </Button>
  )
}
