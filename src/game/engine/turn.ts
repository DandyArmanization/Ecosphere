import systemsData from '../../data/systems.json'
import eventsData from '../../data/events.json'
import balanceData from '../../data/balance.json'
import type { GameState, SystemId, SystemLevels, LastEvent } from '../state/types'

type EventDef = (typeof eventsData)[keyof typeof eventsData]

// Cost to go from `currentLevel` to `currentLevel + 1`, or null if already maxed out.
export function getUpgradeCost(systemId: SystemId, currentLevel: number): number | null {
  const def = systemsData[systemId]
  if (currentLevel >= def.maxLevel) return null
  const costs: number[] = def.upgradeCosts
  return costs[currentLevel - 1] ?? null
}

// Returns a new state with the system upgraded, or the same state unchanged
// if the upgrade isn't affordable or the system is already maxed.
export function upgradeSystem(state: GameState, systemId: SystemId): GameState {
  const currentLevel = state.systemLevels[systemId]
  const cost = getUpgradeCost(systemId, currentLevel)
  if (cost === null || state.money < cost) return state

  return {
    ...state,
    money: state.money - cost,
    systemLevels: { ...state.systemLevels, [systemId]: currentLevel + 1 },
  }
}

function totalSystemLevels(levels: SystemLevels): number {
  return levels.energy + levels.water + levels.policy
}

export function calculateWeeklyTax(levels: SystemLevels): number {
  return balanceData.baseWeeklyTax + totalSystemLevels(levels) * balanceData.taxPerSystemLevel
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

// Randomly decides whether a climate event happens this week, based on
// balance.json's eventChancePerWeek, and if so, which one from the region's list.
function rollEvent(possibleEventIds: string[]): EventDef | null {
  if (Math.random() >= balanceData.eventChancePerWeek) return null
  const eventId = pickRandom(possibleEventIds) as keyof typeof eventsData
  return eventsData[eventId]
}

export function resolveEventDamage(event: EventDef, levels: SystemLevels): number {
  const primarySystemId = event.mitigatingSystemId as SystemId
  const primaryMitigation = levels[primarySystemId] * event.mitigationPerLevel
  const policyMitigation = levels.policy * balanceData.policyMitigationPerLevel
  const rawDamage = event.baseDamage - primaryMitigation - policyMitigation
  return Math.max(0, rawDamage)
}

// Runs one full week: resolve a possible climate event, collect tax income,
// advance the week counter, and check win/lose conditions.
export function advanceWeek(state: GameState, possibleEventIds: string[]): GameState {
  if (state.status !== 'playing') return state

  const event = rollEvent(possibleEventIds)
  let resilience = state.resilience
  let lastEvent: LastEvent | null = null

  if (event) {
    const damage = resolveEventDamage(event, state.systemLevels)
    resilience = Math.max(0, resilience - damage)
    lastEvent = { name: event.name, damage }
  }

  const nextWeek = state.week + 1
  const money = state.money + calculateWeeklyTax(state.systemLevels)

  let status: GameState['status'] = 'playing'
  if (resilience <= balanceData.loseResilienceThreshold) {
    status = 'lost'
  } else if (nextWeek > balanceData.totalWeeks) {
    status = 'won'
  }

  return {
    ...state,
    week: Math.min(nextWeek, balanceData.totalWeeks),
    money,
    resilience,
    status,
    lastEvent,
  }
}
