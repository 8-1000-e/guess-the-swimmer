import { SWIMMERS } from '@/data/swimmers'

export type LetterState = 'correct' | 'present' | 'absent'

export interface LetterResult {
  letter: string
  state: LetterState
}

export const MAX_ATTEMPTS = 6

export function candidatesOfLength(length: number): string[] {
  return SWIMMERS.filter((s) => s.length === length)
}

export function playableLengths(min = 4): number[] {
  const counts = new Map<number, number>()
  for (const s of SWIMMERS) counts.set(s.length, (counts.get(s.length) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([, n]) => n >= min)
    .map(([len]) => len)
    .sort((a, b) => a - b)
}

export function scoreGuess(guess: string, solution: string): LetterResult[] {
  const result: LetterResult[] = [...guess].map((letter) => ({
    letter,
    state: 'absent' as LetterState,
  }))

  const remaining = new Map<string, number>()
  for (let i = 0; i < solution.length; i++) {
    if (guess[i] === solution[i]) result[i].state = 'correct'
    else remaining.set(solution[i], (remaining.get(solution[i]) ?? 0) + 1)
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i].state === 'correct') continue
    const left = remaining.get(guess[i]) ?? 0
    if (left > 0) {
      result[i].state = 'present'
      remaining.set(guess[i], left - 1)
    }
  }

  return result
}

export function keyboardStates(
  rows: LetterResult[][],
): Record<string, LetterState> {
  const rank: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 }
  const map: Record<string, LetterState> = {}
  for (const row of rows) {
    for (const { letter, state } of row) {
      const current = map[letter]
      if (!current || rank[state] > rank[current]) map[letter] = state
    }
  }
  return map
}

export function dailySolution(pool: string[], date = new Date()): string {
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return pool[hash % pool.length]
}

export function randomSolution(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}
