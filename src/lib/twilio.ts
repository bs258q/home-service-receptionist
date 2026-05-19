import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function provisionPhoneNumber(areaCode: string = '415'): Promise<string> {
  const fallbackCodes = [areaCode, '415', '408', '650', '510', '213', '312', '646']
  const unique = [...new Set(fallbackCodes)]

  for (const code of unique) {
    const available = await client.availablePhoneNumbers('US')
      .local.list({ areaCode: parseInt(code), limit: 1 })
    if (available.length) {
      const number = await client.incomingPhoneNumbers.create({
        phoneNumber: available[0].phoneNumber,
        voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice`,
      })
      return number.phoneNumber
    }
  }

  throw new Error('No numbers available in any fallback area code')
}

export async function sendSms(to: string, body: string): Promise<void> {
  await client.messages.create({
    to,
    from: process.env.TWILIO_NUMBER!,
    body,
  })
}

export function validateTwilioRequest(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  )
}
