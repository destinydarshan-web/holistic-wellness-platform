import { z } from 'zod'

const RecommendationSchema = z.object({
  primaryService: z.enum(['Astrology', 'Counselling', 'Yoga', 'Meditation']),
  secondaryService: z
    .enum(['Astrology', 'Counselling', 'Yoga', 'Meditation'])
    .optional(),
  reason: z.string().min(30).max(200),
})

type Recommendation = z.infer<typeof RecommendationSchema>

// Semantic keyword mappings for intelligent routing
const CONCERN_PATTERNS = {
  meditation: {
    keywords: ['stress', 'anxiety', 'calm', 'peace', 'quiet', 'mind', 'relax', 'overwhelm', 'pressure', 'focus', 'concentration', 'clarity', 'panic', 'worry', 'sleep'],
    secondary: 'Yoga' as const,
    reasonTemplate: (name: string) => `Meditation will help you cultivate inner peace and mental clarity. ${name ? `${name}, this practice will teach you to calm your mind and reduce the stress you're experiencing.` : 'This practice will teach you to calm your mind.'}`,
  },
  counselling: {
    keywords: ['relationship', 'career', 'life', 'decision', 'confused', 'stuck', 'help', 'talk', 'guidance', 'support', 'depression', 'sad', 'lonely', 'family', 'work', 'personal', 'growth', 'advice'],
    secondary: 'Astrology' as const,
    reasonTemplate: (name: string) => `Professional counselling will provide you with personalized guidance and emotional support. ${name ? `${name}, our experienced counsellors are here to help you navigate this challenge.` : 'Our counsellors will help you find clarity.'}`,
  },
  yoga: {
    keywords: ['body', 'fitness', 'strength', 'flexibility', 'exercise', 'physical', 'movement', 'energy', 'vitality', 'pain', 'mobility', 'posture', 'health', 'wellness', 'balance'],
    secondary: 'Meditation' as const,
    reasonTemplate: (name: string) => `Yoga will strengthen your body and create harmony between your physical and mental well-being. ${name ? `${name}, through consistent practice, you'll experience greater flexibility and inner peace.` : 'You\'ll experience greater physical and mental harmony.'}`,
  },
  astrology: {
    keywords: ['future', 'destiny', 'path', 'timing', 'zodiac', 'horoscope', 'sign', 'cosmic', 'universe', 'purpose', 'direction', 'answers', 'guidance', 'life path', 'what\'s ahead'],
    secondary: 'Meditation' as const,
    reasonTemplate: (name: string) => `Astrological insights will illuminate your life path and help you understand the cosmic timing of your journey. ${name ? `${name}, discover how the stars can guide your decisions.` : 'Discover cosmic guidance for your path.'}`,
  },
}

interface ConcernMatch {
  service: keyof typeof CONCERN_PATTERNS
  score: number
}

function analyzeConcer(concern: string): ConcernMatch {
  const lowerConcern = concern.toLowerCase()
  const scores: Record<keyof typeof CONCERN_PATTERNS, number> = {
    meditation: 0,
    counselling: 0,
    yoga: 0,
    astrology: 0,
  }

  // Calculate relevance score for each service
  Object.entries(CONCERN_PATTERNS).forEach(([service, config]) => {
    config.keywords.forEach((keyword) => {
      if (lowerConcern.includes(keyword)) {
        scores[service as keyof typeof CONCERN_PATTERNS] += 1
      }
    })
  })

  // Bonus points for exact phrases
  if (lowerConcern.includes('talk to someone') || lowerConcern.includes('talk to')) {
    scores.counselling += 3
  }
  if (lowerConcern.includes('inner peace') || lowerConcern.includes('inner calm')) {
    scores.meditation += 2
  }
  if (lowerConcern.includes('my body') || lowerConcern.includes('physical')) {
    scores.yoga += 2
  }

  // Find the service with the highest score
  let topService: keyof typeof CONCERN_PATTERNS = 'counselling'
  let topScore = 0

  Object.entries(scores).forEach(([service, score]) => {
    if (score > topScore) {
      topScore = score
      topService = service as keyof typeof CONCERN_PATTERNS
    }
  })

  // If no keywords matched, default to counselling (most versatile)
  if (topScore === 0) {
    topService = 'counselling'
  }

  return { service: topService, score: topScore }
}

function generateRecommendation(
  concern: string,
  name: string
): Recommendation {
  const match = analyzeConcer(concern)
  const config = CONCERN_PATTERNS[match.service]

  return {
    primaryService: match.service.charAt(0).toUpperCase() + match.service.slice(1) as 'Astrology' | 'Counselling' | 'Yoga' | 'Meditation',
    secondaryService: config.secondary.charAt(0).toUpperCase() + config.secondary.slice(1) as 'Astrology' | 'Counselling' | 'Yoga' | 'Meditation',
    reason: config.reasonTemplate(name),
  }
}

export async function POST(request: Request) {
  try {
    const { concern, name } = await request.json()

    if (!concern || !concern.trim()) {
      return Response.json(
        { error: 'Concern text is required' },
        { status: 400 }
      )
    }

    console.log(
      '[v0] Analyzing concern:',
      concern.substring(0, 50) + '...'
    )

    const recommendation = generateRecommendation(concern, name)

    console.log('[v0] Recommendation generated:', recommendation.primaryService)

    return Response.json(recommendation)
  } catch (error) {
    console.error('[v0] Recommendation error:', error)

    // Fallback to a safe default
    return Response.json({
      primaryService: 'Counselling',
      reason: 'Our counselling service provides compassionate support to help you navigate your challenges with clarity and confidence.',
    })
  }
}
