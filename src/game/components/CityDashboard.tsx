import systemsData from '../../data/systems.json'
import balanceData from '../../data/balance.json'
import { getUpgradeCost } from '../engine/turn'
import { useGameState } from '../state/useGameState'
import type { SystemId } from '../state/types'
import './CityDashboard.css'

const SYSTEM_IDS: SystemId[] = ['energy', 'water', 'policy']

export function CityDashboard() {
  const { state, region, upgrade, nextWeek, reset } = useGameState()

  if (state.status !== 'playing') {
    return (
      <div className="dashboard">
        <h1>{state.status === 'won' ? 'You Win!' : 'Game Over'}</h1>
        <p>
          {state.status === 'won'
            ? `${region.name} survived all ${balanceData.totalWeeks} weeks with a resilience of ${state.resilience}.`
            : `${region.name}'s resilience hit zero in week ${state.week}.`}
        </p>
        <button className="primary" onClick={reset}>
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h1>{region.name}</h1>

      <div className="stats">
        <div className="stat">
          <span className="label">Week</span>
          <span className="value">
            {state.week} / {balanceData.totalWeeks}
          </span>
        </div>
        <div className="stat">
          <span className="label">Money</span>
          <span className="value">${state.money}</span>
        </div>
        <div className="stat">
          <span className="label">Resilience</span>
          <span className="value">
            {state.resilience} / {balanceData.maxResilience}
          </span>
        </div>
      </div>

      {state.lastEvent && (
        <p className="event-log">
          Last week: {state.lastEvent.name} caused {state.lastEvent.damage} resilience damage.
        </p>
      )}

      <div className="systems">
        {SYSTEM_IDS.map((id) => {
          const def = systemsData[id]
          const level = state.systemLevels[id]
          const cost = getUpgradeCost(id, level)
          return (
            <div key={id} className="system-card">
              <h3>{def.name}</h3>
              <p>
                Level {level} / {def.maxLevel}
              </p>
              <button disabled={cost === null || state.money < cost} onClick={() => upgrade(id)}>
                {cost === null ? 'Maxed' : `Upgrade ($${cost})`}
              </button>
            </div>
          )
        })}
      </div>

      <button className="primary next-week" onClick={nextWeek}>
        Next Week
      </button>
    </div>
  )
}
