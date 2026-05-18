'use client'
import { useState } from 'react'

const SERVICES = [
  {
    id: 'hvac',
    label: 'HVAC',
    icon: '❄️',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-600',
    urgentKeywords: ['no heat', 'no ac', 'no cool', 'no cold', 'carbon monoxide', 'gas smell', 'furnace out', 'ac broken'],
    callTips: [
      'Ask if issue is heating or cooling — routes to right tech',
      'Confirm if system is completely out or just underperforming',
      '"No heat in winter" and "carbon monoxide" = always escalate immediately',
      'Collect make/model if customer knows it — saves tech time',
      'Average job: $150–500 for repairs, $3,000–8,000 for full replacement',
    ],
    commonJobs: ['AC tune-up', 'Furnace repair', 'Filter replacement', 'New system install', 'Duct cleaning'],
    bookingTip: 'Offer morning (8–12) or afternoon (12–5) windows. HVAC jobs run 1–3 hours.',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    icon: '🔧',
    color: 'bg-cyan-50 border-cyan-200',
    headerColor: 'bg-cyan-600',
    urgentKeywords: ['flooding', 'burst pipe', 'sewage', 'no water', 'gas leak', 'overflowing', 'water everywhere'],
    callTips: [
      '"Flooding" or "burst pipe" = escalate immediately, every minute counts',
      'Ask if water is actively running — if yes, advise to shut off main valve',
      'Sewage backup = urgent, health hazard, same-day priority',
      'Confirm address + best entry point (front/back door, gate code)',
      'Average job: $100–300 for minor repairs, $1,000+ for pipe replacement',
    ],
    commonJobs: ['Leaky faucet', 'Drain cleaning', 'Water heater', 'Toilet repair', 'Pipe repair'],
    bookingTip: 'Plumbing often needs same-day. Offer earliest slot first.',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    icon: '⚡',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-500',
    urgentKeywords: ['sparks', 'burning smell', 'no power', 'outage', 'shock', 'flickering', 'tripped breaker'],
    callTips: [
      '"Burning smell" or "sparks" = escalate immediately, fire risk',
      'Ask if issue is whole-home or single room/circuit',
      'Confirm if breaker has been tripped — simple reset saves a truck roll',
      'Panel upgrades need permit — mention 2–3 week lead time',
      'Average job: $150–500 for repairs, $2,500+ for panel upgrade',
    ],
    commonJobs: ['Outlet repair', 'Panel upgrade', 'Ceiling fan install', 'EV charger install', 'Lighting'],
    bookingTip: 'Electrical jobs vary widely. Book 2-hour windows, tech calls ahead.',
  },
  {
    id: 'appliance',
    label: 'Appliance Repair',
    icon: '🏠',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-600',
    urgentKeywords: ['gas smell', 'fridge broken', 'food spoiling', 'washing machine flooding'],
    callTips: [
      'Collect appliance brand + model number upfront — determines parts availability',
      'Ask age of appliance — over 10 years often not worth repairing',
      '"Fridge broken with food inside" = same-day priority',
      'Washing machine flood = plumbing crossover, may need both techs',
      'Average job: $100–400 depending on part + labor',
    ],
    commonJobs: ['Refrigerator repair', 'Washer/dryer fix', 'Dishwasher repair', 'Oven/stove repair', 'Microwave'],
    bookingTip: 'Parts may need ordering. Book diagnostic first, follow-up for repair.',
  },
  {
    id: 'garage',
    label: 'Garage Door',
    icon: '🚗',
    color: 'bg-orange-50 border-orange-200',
    headerColor: 'bg-orange-500',
    urgentKeywords: ['stuck open', 'car stuck inside', 'broken spring', 'wont close'],
    callTips: [
      '"Stuck open" = security risk, same-day priority',
      'Broken spring = do not attempt manual operation, safety risk',
      'Ask if door is completely dead or just slow/noisy',
      'Confirm single or double door, and if opener is included',
      'Average job: $150–300 for repairs, $800–1,500 for new door',
    ],
    commonJobs: ['Spring replacement', 'Opener repair', 'Track alignment', 'New door install', 'Panel repair'],
    bookingTip: 'Most garage jobs take under 2 hours. Morning slots preferred.',
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    icon: '🧹',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-600',
    urgentKeywords: ['mold', 'biohazard', 'sewage cleanup', 'move out today'],
    callTips: [
      'Collect home size (sq ft or bed/bath count) for accurate pricing',
      'Ask if recurring or one-time — recurring = better LTV customer',
      '"Move-out clean" often needs same-week scheduling',
      'Mold or biohazard = specialist required, do not book standard cleaning',
      'Average job: $100–300 for standard, $300+ for deep/move-out',
    ],
    commonJobs: ['Standard clean', 'Deep clean', 'Move-out clean', 'Post-construction', 'Window cleaning'],
    bookingTip: 'Cleaning is recurring revenue. Always ask if they want a regular schedule.',
  },
]

export default function ServiceCards() {
  const [selected, setSelected] = useState<string | null>(null)

  const active = SERVICES.find(s => s.id === selected)

  return (
    <div className="mt-8">
      <h2 className="font-semibold mb-4">Service Categories</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SERVICES.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(selected === s.id ? null : s.id)}
            className={`border rounded-lg p-4 text-left transition-all hover:shadow-md ${s.color} ${selected === s.id ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="font-semibold text-sm">{s.label}</div>
            <div className="text-xs text-gray-500 mt-1">{s.commonJobs.length} job types</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className={`${active.headerColor} text-white px-6 py-4 flex items-center gap-3`}>
            <span className="text-3xl">{active.icon}</span>
            <div>
              <h3 className="text-lg font-bold">{active.label} — AI Call Guide</h3>
              <p className="text-sm opacity-80">Tips for configuring and monitoring {active.label} clients</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-gray-700">📞 Call Tips</h4>
              <ul className="space-y-2">
                {active.callTips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gray-700">🚨 Urgent Keywords to Configure</h4>
                <div className="flex flex-wrap gap-2">
                  {active.urgentKeywords.map(kw => (
                    <span key={kw} className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3 text-gray-700">🔨 Common Job Types</h4>
                <div className="flex flex-wrap gap-2">
                  {active.commonJobs.map(job => (
                    <span key={job} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {job}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-xs text-blue-800 mb-1">📅 Booking Tip</h4>
                <p className="text-xs text-blue-700">{active.bookingTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
