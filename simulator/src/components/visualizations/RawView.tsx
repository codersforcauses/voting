import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface ElectionResultsProps {
  results: {
    winners: unknown[]
    tally: Map<unknown, number>[]
    quota: number
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
                    Object.fromEntries(round.entries())
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