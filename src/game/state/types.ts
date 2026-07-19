export type SystemId = 'energy' | 'water' | 'policy'

export interface SystemLevels {
  energy: number
  water: number
  policy: number
}

export type GameStatus = 'playing' | 'won' | 'lost'

export interface LastEvent {
  name: string
  damage: number
}

export interface GameState {
  week: number
  money: number
  resilience: number
  systemLevels: SystemLevels
  status: GameStatus
  lastEvent: LastEvent | null
}
