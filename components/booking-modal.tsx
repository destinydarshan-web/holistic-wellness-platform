'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Phone } from 'lucide-react'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: string
  experts?: string[]
}

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
]

export function BookingModal({
  open,
  onOpenChange,
  service,
  experts = ['Expert 1', 'Expert 2', 'Expert 3'],
}: BookingModalProps) {
  const [step, setStep] = useState<'booking' | 'confirmation'>('booking')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: service,
    expert: 'Any expert',
    date: '',
    time: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      alert('Please fill in all fields')
      return
    }
    setStep('confirmation')
  }

  const handleReset = () => {
    setStep('booking')
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: service,
      expert: 'Any expert',
      date: '',
      time: '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {step === 'booking' ? (
          <>
            <DialogHeader>
              <DialogTitle>Book a Session</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule your {service} session
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <Input
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Expert (Optional)
                </label>
                <Select value={formData.expert} onValueChange={(value) => handleChange('expert', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any expert" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any expert">Any expert</SelectItem>
                    {experts.map((expert) => (
                      <SelectItem key={expert} value={expert}>
                        {expert}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Time
                </label>
                <Select value={formData.time} onValueChange={(value) => handleChange('time', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90">
                Confirm Booking
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Booking Confirmed!</DialogTitle>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Session Details</p>
                <div className="space-y-2 text-foreground">
                  <p>
                    <span className="font-medium">Service:</span> {formData.service}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {formData.date}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {formData.time}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {formData.email}. You'll receive a reminder 24 hours before your session.
              </p>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  Connect with us before your session
                </p>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Phone size={16} />
                    Call
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
                Close
              </Button>
              <Button onClick={handleReset} className="flex-1 bg-primary hover:bg-primary/90">
                Book Another Session
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
