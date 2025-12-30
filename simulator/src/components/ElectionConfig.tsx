import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ElectionConfigProps {
  openings: number
  onOpeningsChange: (openings: number) => void
  totalVoters: number
  votesCast: number
  totalCandidates: number
}

export function ElectionConfig({
  openings,
  onOpeningsChange,
  totalVoters,
  votesCast,
  totalCandidates,
}: ElectionConfigProps) {
  return (
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
            max={totalCandidates}
            value={openings}
            onChange={(e) => onOpeningsChange(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">
            {openings === 1 ? 'Single winner (Instant Runoff)' : `${openings} winners (Hare-Clark STV)`}
          </p>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Voters:</span>
            <span className="font-semibold">{totalVoters}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Votes Cast:</span>
            <span className="font-semibold">{votesCast}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Candidates:</span>
            <span className="font-semibold">{totalCandidates}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
