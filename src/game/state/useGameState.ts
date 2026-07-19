import { useEffect, useState } from 'react'
import ecoregionsData from '../../data/ecoregions.json'
import systemsData from '../../data/systems.json'
import { advanceWeek, upgradeSystem } from '../engine/turn'
import type { GameState, SystemId } from './types'

const SAVE_KEY = 'ecosphere-save-v1'
const REGION_ID = 'boreal'

const region = ecoregionsData[REGION_ID]

function createInitialState(): GameState {
  return {
    week: 1,
    money: region.startingMoney,
    resilience: region.startingResilience,
    systemLevels: {
      energy: systemsData.energy.startingLevel,
      water: systemsData.water.startingLevel,
      policy: systemsData.policy.startingLevel,
    },
    status: 'playing',
    lastEvent: null,
  }
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) return JSON.parse(raw) as GameState
  } catch {
    // Corrupted or unreadable save — fall back to a fresh game.
  }
  return createInitialState()
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState)

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  }, [state])

  function upgrade(systemId: SystemId) {
    setState((prev) => upgradeSystem(prev, systemId))
  }

  function nextWeek() {
    setState((prev) => advanceWeek(prev, region.possibleEventIds))
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY)
    setState(createInitialState())
  }

  return { state, region, upgrade, nextWeek, reset }
}
