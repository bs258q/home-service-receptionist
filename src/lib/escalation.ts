const DEFAULT_URGENT_KEYWORDS = [
  'emergency', 'flooding', 'no heat', 'gas leak', 'burst pipe',
  'sewage', 'no ac', 'fire', 'carbon monoxide',
]

const HUMAN_REQUEST_PHRASES = [
  'speak to someone', 'speak to a person', 'human', 'agent',
  'real person', 'talk to someone', 'manager',
]

export type EscalationTrigger = 'keyword' | 'user_requested' | 'ai_failed' | null

export function detectEscalationTrigger(
  transcript: string,
  clientKeywords: string[] = []
): EscalationTrigger {
  const lower = transcript.toLowerCase()

  for (const phrase of HUMAN_REQUEST_PHRASES) {
    if (lower.includes(phrase)) return 'user_requested'
  }

  const allKeywords = [...DEFAULT_URGENT_KEYWORDS, ...clientKeywords]
  for (const keyword of allKeywords) {
    if (lower.includes(keyword.toLowerCase())) return 'keyword'
  }

  return null
}

export function buildEscalationSms(
  callerNumber: string,
  trigger: EscalationTrigger,
  transcript: string
): string {
  const reason =
    trigger === 'keyword' ? 'urgent keywords detected' :
    trigger === 'user_requested' ? 'customer requested human' :
    'AI could not assist'

  const preview = transcript.slice(-200).replace(/\n/g, ' ')
  return `URGENT call from ${callerNumber} — ${reason}.\nLast message: "${preview}"`
}

export function buildBookingConfirmationSms(params: {
  businessName: string
  scheduledAt: string
  serviceType: string
}): string {
  return `Your appointment with ${params.businessName} is confirmed for ${params.scheduledAt} (${params.serviceType}). We'll see you then!`
}
