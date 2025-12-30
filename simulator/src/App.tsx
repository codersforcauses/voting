import { useState, useMemo } from 'react'
import './App.css'
import { autocount } from './lib/election-system'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VoterManager } from '@/components/VoterManager'
import { CandidateManager } from '@/components/CandidateManager'
import { ElectionConfig } from '@/components/ElectionConfig'
import { VotingTable } from '@/components/VotingTable'
import { ElectionResults } from '@/components/ElectionResults'

function App() {
  // Dynamic lists of voters and candidates
  const [voters, setVoters] = useState<string[]>(['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank'])
  const [candidates, setCandidates] = useState<string[]>(['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D', 'Candidate E'])

  // State: Record<voterId, candidateId[]> - stores preference order for each voter
  const [votes, setVotes] = useState<Record<string, string[]>>({})

  // Number of positions to fill (openings)
  const [openings, setOpenings] = useState(1)

  // Calculate election results
  const results = useMemo(() => {
    // Convert votes to the format expected by autocount
    // Format: Record<Seat, Candidate[]>
    const voteData: Record<string, string[]> = {}

    Object.entries(votes).forEach(([voter, preferences]) => {
      if (preferences.length > 0) {
        voteData[voter] = preferences
      }
    })

    // Only run autocount if there are votes
    if (Object.keys(voteData).length === 0) {
      return null
    }

    try {
      const { candidates: winners, tally } = autocount(voteData, openings)
      // Calculate quota (Drizzle/Hare quota)
      const totalVotes = Object.keys(voteData).length
      const quota = Math.floor(totalVotes / (openings + 1)) + 1
      return { winners, tally, quota }
    } catch (error) {
      console.error('Error counting votes:', error)
      return null
    }
  }, [votes, openings])

  const handleCellClick = (voterId: string, candidateId: string) => {
    setVotes(prev => {
      const voterPreferences = prev[voterId] || []

      // If candidate is already selected, remove it
      if (voterPreferences.includes(candidateId)) {
        return {
          ...prev,
          [voterId]: voterPreferences.filter(id => id !== candidateId)
        }
      }

      // Otherwise, add candidate to the end of preferences
      return {
        ...prev,
        [voterId]: [...voterPreferences, candidateId]
      }
    })
  }

  const addVoter = (name: string) => {
    if (name && !voters.includes(name)) {
      setVoters([...voters, name])
    }
  }

  const addCandidate = (name: string) => {
    if (name && !candidates.includes(name)) {
      setCandidates([...candidates, name])
    }
  }

  const removeVoter = (voterName: string) => {
    setVoters(voters.filter(v => v !== voterName))
    // Clean up votes for removed voter
    setVotes(prev => {
      const newVotes = { ...prev }
      delete newVotes[voterName]
      return newVotes
    })
  }

  const removeCandidate = (candidateName: string) => {
    setCandidates(candidates.filter(c => c !== candidateName))
    // Clean up votes containing removed candidate
    setVotes(prev => {
      const newVotes: Record<string, string[]> = {}
      Object.entries(prev).forEach(([voter, prefs]) => {
        newVotes[voter] = prefs.filter(c => c !== candidateName)
      })
      return newVotes
    })
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Election Simulator</h1>
        <p className="text-muted-foreground mb-6">Interactive voting system with Hare-Clark STV counting</p>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VoterManager
                voters={voters}
                onAddVoter={addVoter}
                onRemoveVoter={removeVoter}
              />
              <CandidateManager
                candidates={candidates}
                onAddCandidate={addCandidate}
                onRemoveCandidate={removeCandidate}
              />
            </div>

            <ElectionConfig
              openings={openings}
              onOpeningsChange={setOpenings}
              totalVoters={voters.length}
              votesCast={Object.keys(votes).filter(v => votes[v].length > 0).length}
              totalCandidates={candidates.length}
            />
          </TabsContent>

          <TabsContent value="vote" className="space-y-6">
            <VotingTable
              voters={voters}
              candidates={candidates}
              votes={votes}
              onCellClick={handleCellClick}
            />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ElectionResults results={results} votes={votes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
