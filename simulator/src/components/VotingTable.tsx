import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useElection } from '@/components/ElectionContext'
import { RefreshCw, SquareCheck, Square } from 'lucide-react'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function VotingTable() {
  const { voters, candidates, votes, toggleVote, setVoterPreferences, updateVotes } = useElection()

  const getPreferenceNumber = (voterId: string, candidateId: string): number | null => {
    const voterPreferences = votes[voterId] || []
    const index = voterPreferences.indexOf(candidateId)
    return index === -1 ? null : index + 1
  }

  const handleCandidateClick = (candidateId: string) => {
    const allHave = voters.every(v => (votes[v] || []).includes(candidateId))
    if (allHave) {
      updateVotes(prev => {
        const next: Record<string, string[]> = {}
        for (const [voter, prefs] of Object.entries(prev)) {
          next[voter] = prefs.filter(c => c !== candidateId)
        }
        return next
      })
    } else {
      updateVotes(prev => {
        const next = { ...prev }
        for (const voter of voters) {
          const prefs = next[voter] || []
          if (!prefs.includes(candidateId)) {
            next[voter] = [...prefs, candidateId]
          }
        }
        return next
      })
    }
  }

  const handleVoterClick = (voterId: string) => {
    const prefs = votes[voterId] || []
    const unselected = candidates.filter(c => !prefs.includes(c))
    if (unselected.length > 0) {
      setVoterPreferences(voterId, [...prefs, ...shuffle(unselected)])
    } else {
      setVoterPreferences(voterId, shuffle(prefs))
    }
  }

  const handleTableHeaderClick = () => {
    voters.forEach(voterId => handleVoterClick(voterId))
  }

  const getPreferenceGradient = (preference: number): string => {
    const maxPreferences = candidates.length
    const opacity = 1 - ((preference - 1) / maxPreferences) * 0.8
    return `rgba(150, 200, 250, ${opacity})`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Votes</CardTitle>
        <p className="text-sm text-muted-foreground">Click cells to set voter preferences (click again to remove)</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full h-full">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-24 flex flex-col justify-center align-center bg-muted group cursor-pointer" onClick={() => handleTableHeaderClick()}>
                    <span className="text-center text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">Randomise All</span>
                  </TableHead>
                  {candidates.map((candidate) => (
                    <TableHead
                      key={candidate}
                      className="text-center min-w-[100px] cursor-pointer hover:bg-muted/50"
                      onClick={() => handleCandidateClick(candidate)}
                    >
                      <div className="flex flex-col items-center justify-center group">
                        {candidate}
                        {voters.every(v => (votes[v] || []).includes(candidate))
                          ? <Square className="size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          : <SquareCheck className="size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        }
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.map((voter) => (
                  <TableRow key={voter}>
                    <TableCell
                      className="h-24 font-medium sticky left-0 z-10 bg-background cursor-pointer hover:bg-muted group"
                      onClick={() => handleVoterClick(voter)}
                    >
                      <div className="flex flex-col items-center justify-between">
                        <span>{voter}</span>
                        <RefreshCw className="size-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                    {candidates.map((candidate) => {
                      const preference = getPreferenceNumber(voter, candidate)
                      const isSelected = preference !== null

                      return (
                        <TableCell key={`${voter}-${candidate}`} className="p-0 relative">
                          <button
                            onClick={() => toggleVote(voter, candidate)}
                            className={`
                              absolute inset-0 transition-all duration-150 font-semibold text-lg
                              ${isSelected
                                ? 'text-white'
                                : 'bg-background hover:bg-muted text-muted-foreground'
                              }
                            `}
                            style={
                              isSelected && preference
                                ? { backgroundColor: getPreferenceGradient(preference) }
                                : undefined
                            }
                          >
                            {preference || ''}
                          </button>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
