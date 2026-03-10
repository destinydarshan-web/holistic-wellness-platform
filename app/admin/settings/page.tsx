'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Settings, ArrowLeft, Save, RefreshCw, Globe, Mail, Shield, Bell, CreditCard, Users, TrendingUp } from 'lucide-react'

interface PlatformSettings {
  site_name: string
  site_description: string
  contact_email: string
  support_email: string
  commission_rate: number
  min_booking_amount: number
  max_booking_amount: number
  auto_approve_experts: boolean
  email_notifications: boolean
  maintenance_mode: boolean
  platform_fee: number
}

export default function AdminSettingsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<PlatformSettings>({
    site_name: 'Destiny Darshan',
    site_description: 'Your trusted wellness platform for astrology, counselling, yoga, and meditation services',
    contact_email: 'support@destinydarshan.com',
    support_email: 'support@destinydarshan.com',
    commission_rate: 10,
    min_booking_amount: 100,
    max_booking_amount: 10000,
    auto_approve_experts: false,
    email_notifications: true,
    maintenance_mode: false,
    platform_fee: 5
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user || !profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      loadSettings()
    }
  }, [user, profile, loading, router])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Debug: Check if platform_settings table exists
      

      // Try to load settings from platform_settings table
      const { data: settingsData, error: settingsError } = await supabase
        .from('platform_settings')
        .select('*')
        .single()

      

      if (settingsError) {
        
        
        // If table doesn't exist or any other error, use default settings
        
        // Use default settings (already set in state)
        return
      }

      if (settingsData && settingsData.settings) {
        
        setSettings(settingsData.settings)
      } else {
        
        // Use default settings (already set in state)
      }
    } catch (error) {
      
      // Don't show any error to user, just use defaults silently
      
      // Use default settings (already set in state)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      

      // Save to platform_settings table
      const { error: saveError } = await supabase
        .from('platform_settings')
        .upsert({
          id: 1,
          settings: settings,
          updated_at: new Date().toISOString()
        })

      

      if (saveError) {
        
        throw saveError
      }

      
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      
      setError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSettingChange = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleReset = () => {
    setSettings({
      site_name: 'Destiny Darshan',
      site_description: 'Your trusted wellness platform for astrology, counselling, yoga, and meditation services',
      contact_email: 'support@destinydarshan.com',
      support_email: 'support@destinydarshan.com',
      commission_rate: 10,
      min_booking_amount: 100,
      max_booking_amount: 10000,
      auto_approve_experts: false,
      email_notifications: true,
      maintenance_mode: false,
      platform_fee: 5
    })
    setSuccess('Settings reset to defaults')
    setTimeout(() => setSuccess(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="pt-24 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
          <p className="text-white/60">Configure platform-wide settings and preferences</p>
        </div>

        {/* Error/Success Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-8 text-center">
            <RefreshCw className="w-8 h-8 text-[#fbcc1e] mx-auto mb-4 animate-spin" />
            <p className="text-white/60">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-[#fbcc1e]" />
                <h2 className="text-xl font-semibold text-white">General Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => handleSettingChange('site_name', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Site Description</label>
                  <textarea
                    value={settings.site_description}
                    onChange={(e) => handleSettingChange('site_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
              </div>
            </div>

            {/* Contact Settings */}
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-5 h-5 text-[#fbcc1e]" />
                <h2 className="text-xl font-semibold text-white">Contact Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Support Email</label>
                  <input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => handleSettingChange('support_email', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
              </div>
            </div>

            {/* Financial Settings */}
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-[#fbcc1e]" />
                <h2 className="text-xl font-semibold text-white">Financial Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={settings.commission_rate}
                    onChange={(e) => handleSettingChange('commission_rate', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Platform Fee (%)</label>
                  <input
                    type="number"
                    value={settings.platform_fee}
                    onChange={(e) => handleSettingChange('platform_fee', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Min Booking Amount (₹)</label>
                  <input
                    type="number"
                    value={settings.min_booking_amount}
                    onChange={(e) => handleSettingChange('min_booking_amount', parseFloat(e.target.value))}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Max Booking Amount (₹)</label>
                  <input
                    type="number"
                    value={settings.max_booking_amount}
                    onChange={(e) => handleSettingChange('max_booking_amount', parseFloat(e.target.value))}
                    min="0"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  />
                </div>
              </div>
            </div>

            {/* User Management Settings */}
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-[#fbcc1e]" />
                <h2 className="text-xl font-semibold text-white">User Management</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Auto-approve Experts</p>
                    <p className="text-white/60 text-sm">Automatically approve new expert applications</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('auto_approve_experts', !settings.auto_approve_experts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.auto_approve_experts ? 'bg-[#fbcc1e]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.auto_approve_experts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-[#fbcc1e]" />
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-white/60 text-sm">Send email notifications for important events</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('email_notifications', !settings.email_notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.email_notifications ? 'bg-[#fbcc1e]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-[#fbcc1e]" />
                <h2 className="text-xl font-semibold text-white">System Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Maintenance Mode</p>
                    <p className="text-white/60 text-sm">Temporarily disable the platform for maintenance</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('maintenance_mode', !settings.maintenance_mode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenance_mode ? 'bg-red-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#fbcc1e] text-black font-medium rounded-lg hover:bg-[#fbcc1e]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
