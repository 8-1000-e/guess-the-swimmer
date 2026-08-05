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

export interface TargetIdentity {
  login: string
  displayName: string | null
  ftPfpUrl: string | null
  location: string | null
}

export interface Round {
  length: number
  guesses: Guess[]
  status: RoundStatus
  attempts: number
  signBonus: number
  target: TargetIdentity | null
}

export interface NeverPlayed {
  code: 'NEVER_PLAYED'
  login: string
  displayName: string | null
  ftPfpUrl: string | null
  staff: boolean
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
  found: number
  attempts: number
  played: number
}

export interface UserRound {
  targetLogin: string | null
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
  found: number
  attempts: number
  played: number
  rounds: UserRound[]
}

export interface RosterEntry {
  login: string
  displayName: string | null
  ftPfpUrl: string | null
  staff: boolean
  me: boolean
  met: boolean
}
