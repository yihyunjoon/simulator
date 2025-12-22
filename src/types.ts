export type Gender = 'male' | 'female'

export interface Human {
  id: number
  name: string
  gender: Gender
  age: number
  motherId?: number
  fatherId?: number
  spouseId?: number
  birthYear?: number
  deathYear?: number
  isAlive: boolean
}

export interface HistoryPoint {
  year: number
  population: number
  births: number
  food: number
}

export interface GameState {
  humans: Human[]
  food: number
  year: number
  nextId: number
  logs: string[]
  history: HistoryPoint[]
}
