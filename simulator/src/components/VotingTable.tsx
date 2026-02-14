import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface VotingTableProps {
  voters: string[]
  candidates: string[]
  votes: Record<string, string[]>
  onCellClick: (voterId: string, candidateId: string) => void
}

export function VotingTable({ voters, candidates, votes, onCellClick }: VotingTableProps) {
  const getPreferenceNumber = (voterId: string, candidateId: string): number | null => {
    const voterPreferences = votes[voterId] || []
    const index = voterPreferences.indexOf(candidateId)
    return index === -1 ? null : index + 1
  }

  const getPreferenceGradient = (preference: number): string => {
    // Calculate opacity: preference 1 = 100%, then gradually decrease
    // Using a scale where preference 1 is darkest (100%) and it gets lighter
    const maxPreferences = candidates.length
    const opacity = 1 - ((preference - 1) / maxPreferences) * 0.8 // Range from 100% to 30%
    return `rgba(150, 200, 250, ${opacity})`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Votes</CardTitle>
        <p className="text-sm text-muted-foreground">Click cells to set voter preferences (click again to remove)</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full h-[600px]">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-muted">Voter</TableHead>
                  {candidates.map((candidate) => (
                    <TableHead key={candidate} className="text-center min-w-[100px]">
                      {candidate}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.map((voter) => (
                  <TableRow key={voter}>
                    <TableCell className="font-medium sticky left-0 z-10 bg-background">
                      {voter}
                    </TableCell>
                    {candidates.map((candidate) => {
                      const preference = getPreferenceNumber(voter, candidate)
                      const isSelected = preference !== null

                      return (
                        <TableCell key={`${voter}-${candidate}`} className="p-0">
                          <button
                            onClick={() => onCellClick(voter, candidate)}
                            className={`
                              w-full h-16 transition-all duration-150 font-semibold text-lg
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
