'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Plus, Trash2, Edit2, Save, X, Check, AlertCircle } from 'lucide-react'

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface DayAvailability {
  day: string
  enabled: boolean
  slots: TimeSlot[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ExpertAvailabilityPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [isOnline, setIsOnline] = useState(false)

  // Role-based access control
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (profile?.role !== 'expert') {
      router.push('/dashboard')
      return
    }
  }, [user, profile, router])

  useEffect(() => {
    loadAvailabilityData()
  }, [])

  const loadAvailabilityData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAvailability: DayAvailability[] = DAYS.map(day => ({
        day,
        enabled: day !== 'Sunday', // Example: closed on Sunday
        slots: [
          {
            id: `${day}-1`,
            day,
            startTime: '09:00',
            endTime: '10:00',
            isAvailable: true
          },
          {
            id: `${day}-2`,
            day,
            startTime: '10:00',
            endTime: '11:00',
            isAvailable: true
          },
          {
            id: `${day}-3`,
            day,
            startTime: '14:00',
            endTime: '15:00',
            isAvailable: true
          },
          {
            id: `${day}-4`,
            day,
            startTime: '15:00',
            endTime: '16:00',
            isAvailable: true
          }
        ]
      }))

      setAvailability(mockAvailability)
    } catch (error) {
      console.error('Error loading availability data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // API call to save availability
      console.log('Saving availability:', availability)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Availability updated successfully!')
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Error saving availability. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    setAvailability(prev => 
      prev.map(d => 
        d.day === day 
          ? { ...d, enabled: !d.enabled }
          : d
      )
    )
  }

  const toggleSlot = (day: string, slotId: string) => {
    setAvailability(prev => 
      prev.map(d => 
        d.day === day 
          ? {
              ...d,
              slots: d.slots.map(slot =>
                slot.id === slotId 
                  ? { ...slot, isAvailable: !slot.isAvailable }
                  : slot
              )
            }
          : d
      )
    )
  }

  const addTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: `${day}-${Date.now()}`,
      day,
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true
    }

    setAvailability(prev => 
      prev.map(d => 
        d.day === day 
          ? { ...d, slots: [...d.slots, newSlot] }
          : d
      )
    )
  }

  const removeTimeSlot = (day: string, slotId: string) => {
    setAvailability(prev => 
      prev.map(d => 
        d.day === day 
          ? { ...d, slots: d.slots.filter(slot => slot.id !== slotId) }
          : d
      )
    )
  }

  const updateTimeSlot = (day: string, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => 
      prev.map(d => 
        d.day === day 
          ? {
              ...d,
              slots: d.slots.map(slot =>
                slot.id === slotId 
                  ? { ...slot, [field]: value }
                  : slot
              )
            }
          : d
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
              <p className="text-gray-600">Set your working hours and availability</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Availability
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Status Toggle */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Status</h2>
              <p className="text-gray-600">Toggle your overall availability status</p>
            </div>
            
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isOnline 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              {isOnline ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Weekly Schedule
            </h2>
            <div className="text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Available
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {availability.map((dayData) => (
              <div key={dayData.day} className="border rounded-lg p-4">
                {/* Day Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDay(dayData.day)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        dayData.enabled ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dayData.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <h3 className="font-medium text-gray-900">{dayData.day}</h3>
                    {!dayData.enabled && (
                      <span className="text-sm text-gray-500">(Unavailable)</span>
                    )}
                  </div>
                  
                  {dayData.enabled && (
                    <button
                      onClick={() => addTimeSlot(dayData.day)}
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </button>
                  )}
                </div>

                {/* Time Slots */}
                {dayData.enabled && (
                  <div className="space-y-2">
                    {dayData.slots.length > 0 ? (
                      dayData.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <button
                            onClick={() => toggleSlot(dayData.day, slot.id)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              slot.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                slot.isAvailable ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          
                          <div className="flex items-center gap-2 flex-1">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(dayData.day, slot.id, 'startTime', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={!slot.isAvailable}
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(dayData.day, slot.id, 'endTime', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={!slot.isAvailable}
                            />
                          </div>
                          
                          <button
                            onClick={() => removeTimeSlot(dayData.day, slot.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">No time slots added</p>
                        <button
                          onClick={() => addTimeSlot(dayData.day)}
                          className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                        >
                          Add your first time slot
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-900 mb-3">Tips for Setting Availability</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Set realistic time slots that you can commit to</li>
            <li>• Include buffer time between sessions</li>
            <li>• Update your availability regularly</li>
            <li>• Consider different time zones if serving international clients</li>
            <li>• Enable/disable slots based on your schedule</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
