const VAPI_BASE = 'https://api.vapi.ai'

async function vapiRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${VAPI_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Vapi error ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function cloneAssistant(params: {
  businessName: string
  calLink: string
  ownerCell: string
  urgentKeywords: string[]
  businessHours?: string
}): Promise<string> {
  const template = await vapiRequest(
    `/assistant/${process.env.VAPI_TEMPLATE_ASSISTANT_ID}`,
    'GET'
  )

  const systemPrompt = template.model.messages
    .find((m: { role: string }) => m.role === 'system')?.content ?? ''

  const filledPrompt = systemPrompt
    .replace('{{business_name}}', params.businessName)
    .replace('{{cal_link}}', params.calLink)
    .replace('{{owner_cell}}', params.ownerCell)
    .replace('{{urgent_keywords}}', params.urgentKeywords.join(', '))
    .replace('{{business_hours}}', params.businessHours ?? 'Monday-Friday 8am-6pm')

  const newAssistant = await vapiRequest('/assistant', 'POST', {
    name: `${params.businessName} Receptionist`,
    model: {
      ...template.model,
      messages: template.model.messages.map((m: { role: string; content: string }) =>
        m.role === 'system' ? { ...m, content: filledPrompt } : m
      ),
    },
    voice: template.voice,
    firstMessage: `Thank you for calling ${params.businessName}, how can I help you today?`,
  })

  return newAssistant.id
}

export async function updateAssistantTransferNumber(
  assistantId: string,
  ownerCell: string
): Promise<void> {
  await vapiRequest(`/assistant/${assistantId}`, 'PATCH', {
    forwardingPhoneNumber: ownerCell,
  })
}

export function validateVapiWebhook(
  signature: string,
  body: string
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto')
  const expected = crypto
    .createHmac('sha256', process.env.VAPI_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return signature === `sha256=${expected}`
}
