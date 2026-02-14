import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VoterManager } from '@/components/VoterManager'
import { CandidateManager } from '@/components/CandidateManager'
import { VotingTable } from '@/components/VotingTable'
import { ElectionResults } from '@/components/ElectionResults'

export function MainLayout() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className=" mx-auto">
        <h1 className="text-3xl text-primary font-bold mb-2">Election Simulator</h1>
        <p className="text-muted-foreground mb-6">Interactive voting system with Hare-Clark STV counting</p>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VoterManager />
              <CandidateManager />
            </div>
          </TabsContent>

          <TabsContent value="vote" className="space-y-6">
            <VotingTable />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ElectionResults />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
