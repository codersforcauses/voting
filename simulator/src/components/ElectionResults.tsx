import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { StackedBarChart } from '@/components/visualizations/StackedBarChart'
import { LineChart } from '@/components/visualizations/LineChart'
import { SankeyDiagram } from '@/components/visualizations/SankeyDiagram'
import { WaterfallChart } from '@/components/visualizations/WaterfallChart'
import { RawView } from './visualizations/RawView'
import { useElection } from '@/components/ElectionContext'
import { autocount } from '@/lib/election-system'

export function ElectionResults() {
  const { voters, candidates, votes } = useElection()
  const [openings, setOpenings] = useState(2)

  const results = useMemo(() => {
    const voteData: Record<string, string[]> = {}
    Object.entries(votes).forEach(([voter, preferences]) => {
      if (preferences.length > 0) {
        voteData[voter] = preferences
      }
    })

    if (Object.keys(voteData).length === 0) return null

    try {
      const { candidates: winners, tally, transferValues } = autocount(voteData, openings)
      const totalVotes = Object.keys(voteData).length
      const quota = Math.floor(totalVotes / (openings + 1)) + 1
      return { winners, tally, quota, transferValues }
    } catch (error) {
      console.error('Error counting votes:', error)
      return null
    }
  }, [votes, openings])

  const votesCast = Object.keys(votes).filter(v => votes[v].length > 0).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Election Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openings">Number of Positions (Openings)</Label>
            <Input
              id="openings"
              type="number"
              min="1"
              max={candidates.length}
              value={openings}
              onChange={(e) => setOpenings(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              {openings === 1 ? 'Single winner (Instant Runoff)' : `${openings} winners (Hare-Clark STV)`}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Voters:</span>
              <span className="font-semibold">{voters.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Votes Cast:</span>
              <span className="font-semibold">{votesCast}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Candidates:</span>
              <span className="font-semibold">{candidates.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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

              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Quota to be elected:</span>
                  <Badge variant="default">{results.quota} votes</Badge>
                </div>
                <Accordion type="single" collapsible className="mt-1">
                  <AccordionItem value="formula" className="border-none">
                    <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
                      Droop Quota Formula
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="font-mono">floor(total votes / (openings + 1)) + 1</p>
                        <p className="font-mono">floor(<span className="text-foreground font-semibold">{votesCast}</span> / (<span className="text-foreground font-semibold">{openings}</span> + 1)) + 1 = <span className="text-foreground font-semibold">{results.quota}</span></p>
                        <div className="mt-2 space-y-0.5">
                          <p><span className="font-semibold text-foreground">{votesCast}</span> — total valid votes cast</p>
                          <p><span className="font-semibold text-foreground">{openings}</span> — positions to fill</p>
                          <p><span className="font-semibold text-foreground">{results.quota}</span> — votes needed to be elected</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Visualizations */}
              <Tabs defaultValue="data" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                  <TabsTrigger value="line">Line Chart</TabsTrigger>
                  <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
                  <TabsTrigger value="sankey">Sankey</TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="mt-6">
                  <RawView votes={votes} results={results}></RawView>
                </TabsContent>

                <TabsContent value="bar" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <StackedBarChart tally={results.tally} quota={results.quota} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="line" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <LineChart tally={results.tally} quota={results.quota} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="waterfall" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <WaterfallChart tally={results.tally} quota={results.quota} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sankey" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <SankeyDiagram votes={votes} tally={results.tally} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No votes cast yet</p>
              <p className="text-sm mt-2">Go to the Vote tab to start recording preferences</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
