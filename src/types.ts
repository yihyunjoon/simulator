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

export interface GameState {
  humans: Human[]
  allHumans: Human[] // includes deceased for family tree
  food: number
  year: number
  nextId: number
  logs: string[]
}
