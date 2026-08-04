import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api/client'
import { ROUTES } from '@/api/routes'
import type {
  Guess,
  GuessResponse,
  LetterResult,
  LetterState,
  Round,
  Target,
} from '@/types/game'
import type { ApiError } from '@/types/auth'

function keyboardStates(rows: LetterResult[][]): Record<string, LetterState> {
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

export function useGame() {
  const [round, setRound] = useState<Round | null>(null)
  const [targets, setTargets] = useState<Target[]>([])
  const [current, setCurrent] = useState('')
  const [solved, setSolved] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    const [r, t] = await Promise.all([
      api.get<Round>(ROUTES.game.round),
      api.get<Target[]>(ROUTES.game.targets),
    ])
    setRound(r)
    setTargets(t)
    setSolved(r.guesses.some((g) => g.result.every((c) => c.state === 'correct')))
    setLoading(false)
  }, [])

  useEffect(() => {
    load().catch((e: ApiError) => {
      setMessage(e.message)
      setLoading(false)
    })
  }, [load])

  const length = round?.length ?? 0

  const type = useCallback(
    (letter: string) => {
      if (solved) return
      setMessage('')
      setCurrent((c) => (c.length >= length ? c : c + letter.toLowerCase()))
    },
    [solved, length],
  )

  const backspace = useCallback(() => {
    setMessage('')
    setCurrent((c) => c.slice(0, -1))
  }, [])

  const submit = useCallback(async () => {
    if (solved || submitting || !round) return
    if (current.length !== round.length) {
      setMessage(`Il faut ${round.length} lettres`)
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post<GuessResponse>(ROUTES.game.guess, {
        value: current,
      })
      const guess: Guess = {
        id: `local-${Date.now()}`,
        value: current,
        result: res.result,
        createdAt: new Date().toISOString(),
      }
      setRound({ ...round, guesses: [...round.guesses, guess] })
      setTargets((ts) =>
        ts.map((t) => (t.login === current ? { ...t, guessed: true } : t)),
      )
      setCurrent('')
      setSolved(res.solved)
      setMessage(res.solved ? `Trouvé en ${res.attempts} essais !` : '')
    } catch (e) {
      setMessage((e as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }, [solved, submitting, round, current])

  const rows = useMemo(
    () => round?.guesses.map((g) => g.result) ?? [],
    [round],
  )
  const keys = useMemo(() => keyboardStates(rows), [rows])

  return {
    round,
    targets,
    rows,
    current,
    length,
    solved,
    message,
    loading,
    submitting,
    keys,
    type,
    backspace,
    submit,
    reload: load,
  }
}
