/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { generateIds } from '@/lib/utils'

interface ElectionContextType {
  voters: string[]
  candidates: string[]
  votes: Record<string, string[]>
  addVoter: (name: string) => void
  removeVoter: (name: string) => void
  addCandidate: (name: string) => void
  removeCandidate: (name: string) => void
  toggleVote: (voterId: string, candidateId: string) => void
  setVoterPreferences: (voterId: string, preferences: string[]) => void
  updateVotes: (updater: (prev: Record<string, string[]>) => Record<string, string[]>) => void
}

const ElectionContext = createContext<ElectionContextType | null>(null)

export function useElection() {
  const ctx = useContext(ElectionContext)
  if (!ctx) throw new Error('useElection must be used within ElectionProvider')
  return ctx
}

export function ElectionProvider({ children }: { children: ReactNode }) {
  const [voters, setVoters] = useState<string[]>(() => generateIds(25, 5))
  const [candidates, setCandidates] = useState<string[]>(() => generateIds(10, 2))
  const [votes, setVotes] = useState<Record<string, string[]>>({})

  const addVoter = (name: string) => {
    if (name && !voters.includes(name)) {
      setVoters(prev => [...prev, name])
    }
  }

  const removeVoter = (name: string) => {
    setVoters(prev => prev.filter(v => v !== name))
    setVotes(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const addCandidate = (name: string) => {
    if (name && !candidates.includes(name)) {
      setCandidates(prev => [...prev, name])
    }
  }

  const removeCandidate = (name: string) => {
    setCandidates(prev => prev.filter(c => c !== name))
    setVotes(prev => {
      const next: Record<string, string[]> = {}
      Object.entries(prev).forEach(([voter, prefs]) => {
        next[voter] = prefs.filter(c => c !== name)
      })
      return next
    })
  }

  const toggleVote = (voterId: string, candidateId: string) => {
    setVotes(prev => {
      const prefs = prev[voterId] || []
      if (prefs.includes(candidateId)) {
        return { ...prev, [voterId]: prefs.filter(id => id !== candidateId) }
      }
      return { ...prev, [voterId]: [...prefs, candidateId] }
    })
  }

  const setVoterPreferences = (voterId: string, preferences: string[]) => {
    setVotes(prev => ({ ...prev, [voterId]: preferences }))
  }

  const updateVotes = (updater: (prev: Record<string, string[]>) => Record<string, string[]>) => {
    setVotes(updater)
  }

  return (
    <ElectionContext.Provider value={{ voters, candidates, votes, addVoter, removeVoter, addCandidate, removeCandidate, toggleVote, setVoterPreferences, updateVotes }}>
      {children}
    </ElectionContext.Provider>
  )
}
