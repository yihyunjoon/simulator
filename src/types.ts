export type Gender = 'male' | 'female'

export interface Human {
  id: number
  name: string
  gender: Gender
  age: number
}

export interface GameState {
  humans: Human[]
  food: number
  year: number
  nextId: number
  logs: string[]
}
