import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle } from 'lucide-react'

interface ElectionResultsProps {
  results: {
    winners: unknown[]
    tally: Map<unknown, number>[]
    quota: number
  } | null
  votes: Record<string, string[]>
}

export function ElectionResults({ results, votes }: ElectionResultsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Election Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {results.winners.length === 1 ? 'Winner' : 'Winners'}
                </h3>
                <div className="space-y-2">
                  {results.winners.map((winner, index) => (
                    <div
                      key={String(winner)}
                      className="border rounded-lg p-4 flex items-center gap-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    >
                      <Badge variant="default" className="bg-green-600 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <div className="font-semibold text-lg">{String(winner)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tally Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Count Rounds</h3>
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Quota to be elected:</span>
                    <Badge variant="default">{results.quota} votes</Badge>
                  </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {results.tally.map((round, roundIndex) => (
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
                            .sort(([, a], [, b]) => b - a)
                            .map(([candidate, count]) => {
                              const meetsQuota = count >= results.quota
                              return (
                                <div
                                  key={String(candidate)}
                                  className={`flex justify-between items-center p-2 rounded ${
                                    meetsQuota
                                      ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {meetsQuota && (
                                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    )}
                                    <span className="font-medium">{String(candidate)}</span>
                                  </div>
                                  <Badge variant={meetsQuota ? "default" : "secondary"} className={meetsQuota ? "bg-green-600 hover:bg-green-600" : ""}>
                                    {count.toFixed(2)} votes
                                  </Badge>
                                </div>
                              )
                            })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No votes cast yet</p>
              <p className="text-sm mt-2">Go to the Vote tab to start recording preferences</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug info - can remove later */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vote Data (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
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
            <ScrollArea className="h-[300px]">
              {results ? (
                <pre className="bg-muted p-4 rounded text-sm">
                  {JSON.stringify(
                    results.tally.map(round =>
                      Object.fromEntries(round.entries())
                    ),
                    null,
                    2
                  )}
                </pre>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No results yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
