export type LetterState = 'correct' | 'present' | 'absent'

export type RoundStatus = 'playing' | 'solved' | 'validated' | 'expired'

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

export interface QrToken {
  token: string
  expiresAt: string
}

export interface SignResponse {
  validated: boolean
  player: { login: string; name: string } | null
  bonus: number
}

export interface LeaderboardRow {
  rank: number
  login: string
  ftPfpUrl: string | null
  validated: number
  attempts: number
  played: number
}

export interface UserRound {
  targetLogin: string
  status: RoundStatus
  attempts: number
  assignedOn: string
  validatedAt: string | null
}

export interface UserStats {
  login: string
  name: string
  ftPfpUrl: string | null
  campus: string | null
  createdAt: string
  validated: number
  attempts: number
  played: number
  rounds: UserRound[]
}
