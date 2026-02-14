import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useElection } from '@/components/ElectionContext'

export function CandidateManager() {
  const { candidates, addCandidate, removeCandidate } = useElection()
  const [newCandidateName, setNewCandidateName] = useState('')

  const handleAdd = () => {
    if (newCandidateName.trim()) {
      addCandidate(newCandidateName.trim())
      setNewCandidateName('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Candidate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newCandidateName}
            onChange={(e) => setNewCandidateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Candidate name"
            className="flex-1"
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidates.map((candidate) => (
            <Badge key={candidate} variant="secondary" className="gap-1 pr-1">
              <span>{candidate}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCandidate(candidate)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
