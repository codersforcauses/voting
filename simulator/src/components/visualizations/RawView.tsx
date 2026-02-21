import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { TallyEntry } from '@lib/election-system/src/types'

export interface ElectionResultsProps {
  results: {
    winners: unknown[]
    tally: Map<unknown, TallyEntry>[]
    quota: number
    transferValues: Map<string, number>
  }
  votes: Record<string, string[]>
}

export function RawView({ results, votes }: ElectionResultsProps) {
  return (
    <div className="space-y-4">
      {/* Tally Information */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Count Rounds</h3>
        <Accordion type="multiple" className="w-full">
          {results.tally.map((round, roundIndex) => {
            const prevRound = roundIndex > 0 ? results.tally[roundIndex - 1] : null
            const nextRound = roundIndex < results.tally.length - 1 ? results.tally[roundIndex + 1] : null
            const nextRoundKeys = nextRound ? new Set(Array.from(nextRound.keys()).map(String)) : null

            return (
            <AccordionItem key={roundIndex} value={`round-${roundIndex}`}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Round {roundIndex + 1}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {Array.from(round.entries()).length} candidates
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {Array.from(round.entries())
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([candidate, entry]) => {
                      const count = entry.count
                      const meetsQuota = count >= results.quota
                      const candidateKey = String(candidate)
                      const prevCount = prevRound?.get(candidate)?.count ?? null
                      const pointChange = prevCount !== null ? count - prevCount : null
                      const removedNextRound = nextRoundKeys !== null && !nextRoundKeys.has(candidateKey)
                      const isElected = meetsQuota
                      const isEliminated = removedNextRound && !meetsQuota

                      return (
                        <div
                          key={candidateKey}
                          className={`flex justify-between items-center p-2 rounded ${
                            isElected
                              ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                              : isEliminated
                              ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                              : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isElected && (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                            {isEliminated && (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className="font-medium">{candidateKey}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {pointChange !== null && pointChange !== 0 && (
                              <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
                                {pointChange > 0 ? '+' : ''}{pointChange.toFixed(2)} votes
                              </Badge>
                            )}
                            <Badge variant={meetsQuota ? "default" : "secondary"} className={meetsQuota ? "bg-green-600 hover:bg-green-600" : ""}>
                              {count.toFixed(2)} votes
                            </Badge>
                            {isElected && results.transferValues.get(candidateKey) !== undefined && (
                              <Badge variant="outline" className="text-xs border-orange-400 dark:border-orange-700">
                                x {parseFloat(results.transferValues.get(candidateKey)!.toFixed(4))}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
            )
          })}
        </Accordion>
      </div>

      {/* Debug info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vote Data (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-75">
              <pre className="bg-muted p-4 rounded text-sm">
                {JSON.stringify(votes, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Tally Data (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-75">
              <pre className="bg-muted p-4 rounded text-sm">
                {JSON.stringify(
                  results.tally.map(round =>
                    Object.fromEntries(
                      Array.from(round.entries()).map(([k, v]) => [String(k), v])
                    )
                  ),
                  null,
                  2
                )}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}