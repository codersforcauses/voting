import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useElection } from '@/components/ElectionContext'

export function VoterManager() {
  const { voters, addVoter, removeVoter } = useElection()
  const [newVoterName, setNewVoterName] = useState('')

  const handleAdd = () => {
    if (newVoterName.trim()) {
      addVoter(newVoterName.trim())
      setNewVoterName('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Voter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newVoterName}
            onChange={(e) => setNewVoterName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Voter name"
            className="flex-1"
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {voters.map((voter) => (
            <Badge key={voter} variant="secondary" className="gap-1 pr-1">
              <span>{voter}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeVoter(voter)}
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
