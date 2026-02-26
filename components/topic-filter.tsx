'use client'

import React, { useState } from 'react'

interface TopicFilterProps {
  onTopicChange?: (topic: string | null) => void
  resultCount?: number
  activeTopic?: string | null
}

const topics = [
  'Love',
  'Career', 
  'Marriage',
  'Finance',
  'Health',
  'Business',
  'Education'
]

export function TopicFilter({ onTopicChange, resultCount = 12, activeTopic }: TopicFilterProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(activeTopic || null)

  const handleTopicClick = (topic: string) => {
    const newTopic = selectedTopic === topic ? null : topic
    setSelectedTopic(newTopic)
    onTopicChange?.(newTopic)
    
    // Scroll to astrologer grid
    const astrologerSection = document.getElementById('astrologer-grid')
    if (astrologerSection) {
      astrologerSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleClearFilter = () => {
    setSelectedTopic(null)
    onTopicChange?.(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      {/* Result Count */}
      {selectedTopic && (
        <div className="mb-3 text-sm text-neutral-600 animate-fade-in">
          Showing {resultCount} astrologers for {selectedTopic}
        </div>
      )}
      
      {/* Topic Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-visible">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 h-9 border border-neutral-300 ${
              selectedTopic === topic
                ? 'bg-[#fbcc1e] text-black shadow-sm border-[#fbcc1e]'
                : 'bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:scale-95'
            }`}
          >
            {topic}
          </button>
        ))}
        
        {/* Clear Filter Chip */}
        {selectedTopic && (
          <button
            onClick={handleClearFilter}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 h-9 border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:scale-95"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  )
}
