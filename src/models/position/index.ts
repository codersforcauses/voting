import tableQuery from './table.sql'
import seedQuery from './seed.sql'
import { VotingObject } from '..'
import { z } from 'zod'

export type Position = {
  positionId: string,
  title: string,
  priority: number
}

export function getAllPositions(this: VotingObject) {
    const cursor = this.sql.exec("SELECT * from position;")
    
    const positions= []
    for (let row of cursor) {
      positions.push(row)
    }

    return positions
} 

export function getPosition(this: VotingObject, id: Pick<Position, "positionId">) {
    this.sql.exec("SELECT * FROM position WHERE positionId = @0", id)
}

export const createSchema = z.object({
  title: z.string(),
  order: z.number(),
})

export function createPosition(this: VotingObject, { title, order }: z.infer<typeof createSchema>) {
  this.sql.exec("INSERT INTO position (title, order) VALUES (@0, @1);", title, order)
} 

export function deletePosition(this: VotingObject, id: Pick<Position, "positionId">) {
    this.sql.exec("DELETE FROM positions WHERE positionId=@0", id)
}

export function updatePosition(
  this: VotingObject,
  id: Pick<Position, "positionId">,
  { title, priority }: Omit<Position, "positionId">
) {
  if (title && priority) {
    this.sql.exec("UPDATE positions SET title = @1, priority = @2 WHERE positionId=@0", id, title, priority)
  } else if (title) {
    this.sql.exec("UPDATE positions SET title = @1 WHERE positionId=@0", id, title)
  } else if (priority) {
    this.sql.exec("UPDATE positions SET priority = @1 WHERE positionId=@0", id, priority)
  }
}

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
}
