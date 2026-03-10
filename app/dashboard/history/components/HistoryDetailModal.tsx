'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { X, Calendar, Clock, User, Star, MessageCircle, Users, Sparkles, TrendingUp, DollarSign, ChevronLeft, ChevronRight, Download, FileText, Video, Phone } from 'lucide-react'
import ServiceSpecificDetails from './ServiceSpecificDetails'

interface HistoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  historyItem: any
}

interface ChatMessage {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender_type: 'user' | 'expert'
}

interface SessionRecording {
  id: string
  recording_url?: string
  duration?: number
  session_notes?: string
}

export default function HistoryDetailModal({ isOpen, onClose, historyItem }: HistoryDetailModalProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [sessionRecording, setSessionRecording] = useState<SessionRecording | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'media' | 'notes'>('overview')
  const [currentPage, setCurrentPage] = useState(1)
  const messagesPerPage = 20

  useEffect(() => {
    if (isOpen && historyItem) {
      fetchDetailData()
    }
  }, [isOpen, historyItem])

  const fetchDetailData = async () => {
    setLoading(true)
    try {
      if (historyItem.type === 'session' || historyItem.type === 'booking') {
        // Fetch chat messages for sessions
        if (historyItem.service?.mode === 'chat') {
          const { data: messages } = await supabase
            .from('session_messages')
            .select('*')
            .eq('session_id', historyItem.id)
            .order('created_at', { ascending: true })

          if (messages) {
            setChatMessages(messages)
          }
        }

        // Fetch session recordings for video/audio sessions
        if (historyItem.service?.mode === 'video' || historyItem.service?.mode === 'audio') {
          const { data: recording } = await supabase
            .from('session_recordings')
            .select('*')
            .eq('session_id', historyItem.id)
            .single()

          if (recording) {
            setSessionRecording(recording)
          }
        }
      }
    } catch (error) {
      
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'astrology': return <Star className="w-5 h-5" />
      case 'counselling': return <MessageCircle className="w-5 h-5" />
      case 'yoga': return <Users className="w-5 h-5" />
      case 'meditation': return <Sparkles className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
  }

  const getServiceColor = (category: string) => {
    switch (category) {
      case 'astrology': return 'text-purple-600 bg-purple-100'
      case 'counselling': return 'text-blue-600 bg-blue-100'
      case 'yoga': return 'text-green-600 bg-green-100'
      case 'meditation': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const exportChatHistory = () => {
    const chatContent = chatMessages.map(msg => 
      `[${new Date(msg.created_at).toLocaleString()}] ${msg.sender_type === 'user' ? 'You' : 'Expert'}: ${msg.message}`
    ).join('\n')

    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${historyItem.id}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const indexOfLastMessage = currentPage * messagesPerPage
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage
  const currentMessages = chatMessages.slice(indexOfFirstMessage, indexOfLastMessage)
  const totalPages = Math.ceil(chatMessages.length / messagesPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (!isOpen || !historyItem) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{historyItem.title}</h2>
              <p className="text-sm text-gray-600">{historyItem.description}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(historyItem.status)}`}>
            {historyItem.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['overview', 'chat', 'media', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Service Specific Details */}
                  <ServiceSpecificDetails 
                    service={historyItem.service || {}} 
                    sessionData={historyItem.metadata}
                  />

                  {/* Expert Information */}
                  {historyItem.expert && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Expert Information</h3>
                      <div className="flex items-center gap-4">
                        {historyItem.expert.avatar ? (
                          <img
                            src={historyItem.expert.avatar}
                            alt={historyItem.expert.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{historyItem.expert.name}</p>
                          <p className="text-sm text-gray-600">{historyItem.expert.specialization}</p>
                          {historyItem.metadata?.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{historyItem.metadata.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Session Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Session Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{new Date(historyItem.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-medium">{new Date(historyItem.date).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      {historyItem.amount !== undefined && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className={`font-medium ${historyItem.type === 'transaction' && historyItem.description.includes('debit') ? 'text-red-600' : 'text-green-600'}`}>
                              {historyItem.type === 'transaction' && historyItem.description.includes('debit') ? '-' : '+'}₹{historyItem.amount}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review */}
                  {historyItem.metadata?.review && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Your Review</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (historyItem.metadata?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{historyItem.metadata.review}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="p-6">
                  {historyItem.service?.mode === 'chat' ? (
                    <div className="space-y-4">
                      {/* Chat Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Chat History</h3>
                        <button
                          onClick={exportChatHistory}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>

                      {/* Messages */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {currentMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chat History</h3>
                      <p className="text-gray-600">
                        This was a {historyItem.service?.mode} session, so there's no chat history available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="p-6">
                  {sessionRecording || historyItem.service?.mode === 'video' || historyItem.service?.mode === 'audio' ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Session Recording</h3>
                      {sessionRecording?.recording_url ? (
                        <div className="bg-gray-50 rounded-xl p-6">
                          <video
                            src={sessionRecording.recording_url}
                            controls
                            className="w-full rounded-lg"
                          />
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Duration: {sessionRecording.duration} minutes
                            </p>
                            <button className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recording Available</h3>
                          <p className="text-gray-600">
                            The recording for this session is not available.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Media Available</h3>
                      <p className="text-gray-600">
                        This was a {historyItem.service?.mode || 'chat'} session, so there's no media recording available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Session Notes</h3>
                    {sessionRecording?.session_notes ? (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {sessionRecording.session_notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes Available</h3>
                        <p className="text-gray-600">
                          No session notes were recorded for this consultation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Session ID: {historyItem.id}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
