export type LetterState = 'correct' | 'present' | 'absent'

export interface LetterResult {
  letter: string
  state: LetterState
}

export interface Guess {
  id: string
  value: string
  result: LetterResult[]
  createdAt: string
}

export interface Round {
  length: number
  guesses: Guess[]
}

export interface GuessResponse {
  result: LetterResult[]
  solved: boolean
  attempts: number
}

export interface Target {
  login: string
  validated: boolean
  solved: boolean
  guessed: boolean
}
