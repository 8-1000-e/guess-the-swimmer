import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MAX_ATTEMPTS,
  candidatesOfLength,
  keyboardStates,
  randomSolution,
  scoreGuess,
  type LetterResult,
} from './engine'

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  solution: string
  length: number
  rows: LetterResult[][]
  current: string
  status: GameStatus
  message: string
  keys: Record<string, ReturnType<typeof scoreGuess>[number]['state']>
  pool: string[]
  type: (letter: string) => void
  backspace: () => void
  submit: () => void
  reset: () => void
}

export function useGame(length: number): GameState {
  const pool = useMemo(() => candidatesOfLength(length), [length])
  const [solution, setSolution] = useState(() => randomSolution(pool))
  const [rows, setRows] = useState<LetterResult[][]>([])
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState<GameStatus>('playing')
  const [message, setMessage] = useState('')

  const reset = useCallback(() => {
    setSolution(randomSolution(pool))
    setRows([])
    setCurrent('')
    setStatus('playing')
    setMessage('')
  }, [pool])

  useEffect(() => {
    reset()
  }, [reset])

  const type = useCallback(
    (letter: string) => {
      if (status !== 'playing') return
      setMessage('')
      setCurrent((c) => (c.length >= length ? c : c + letter.toLowerCase()))
    },
    [status, length],
  )

  const backspace = useCallback(() => {
    if (status !== 'playing') return
    setMessage('')
    setCurrent((c) => c.slice(0, -1))
  }, [status])

  const submit = useCallback(() => {
    if (status !== 'playing') return
    if (current.length !== length) {
      setMessage(`Il faut ${length} lettres`)
      return
    }
    if (!pool.includes(current)) {
      setMessage("Ce login n'est pas dans la piscine")
      return
    }

    const row = scoreGuess(current, solution)
    const next = [...rows, row]
    setRows(next)
    setCurrent('')

    if (current === solution) {
      setStatus('won')
      setMessage('Trouvé !')
    } else if (next.length >= MAX_ATTEMPTS) {
      setStatus('lost')
      setMessage(`C'était ${solution}`)
    }
  }, [status, current, length, pool, solution, rows])

  const keys = useMemo(() => keyboardStates(rows), [rows])

  return {
    solution,
    length,
    rows,
    current,
    status,
    message,
    keys,
    pool,
    type,
    backspace,
    submit,
    reset,
  }
}
