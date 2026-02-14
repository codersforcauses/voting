import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StackedBarChart } from '@/components/visualizations/StackedBarChart'
import { LineChart } from '@/components/visualizations/LineChart'
import { SankeyDiagram } from '@/components/visualizations/SankeyDiagram'
import { WaterfallChart } from '@/components/visualizations/WaterfallChart'
import { RawView, type ElectionResultsProps } from './visualizations/RawView'

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

              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Quota to be elected:</span>
                  <Badge variant="default">{results.quota} votes</Badge>
                </div>
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
