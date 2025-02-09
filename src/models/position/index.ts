import tableQuery from './table.sql'
import seedQuery from './seed.sql'
import { VotingObject } from '..'
import { z } from 'zod'

export function getAllPositions(this: VotingObject) {
  try {
    const cursor = this.sql.exec("SELECT * from position;")
    
    const positions= []
    for (let row of cursor) {
      positions.push(row)
    }
    
    return positions
  } catch (e) {
    console.error(e)
    return []
  }
} 

export function getPosition(this: VotingObject, id: string) {
    this.sql.exec("SELECT * FROM position WHERE positionId = @0", id)
}

export const createSchema = z.object({
  title: z.string(),
  order: z.number(),
})

export function createPosition(this: VotingObject, { title, order }: z.infer<typeof createSchema>) {
  this.sql.exec("INSERT INTO position (title, order) VALUES (@0, @1);", title, order)
} 

export function deletePosition(this: VotingObject, id: string) {
    this.sql.exec("DELETE FROM positions WHERE positionId=@0", id)
}

export const updateSchema = z.object({
  title: z.string(),
  order: z.number(),
})

export function updatePosition(
  this: VotingObject,
  id: string,
  { title, order }: z.infer<typeof updateSchema>
) {
  const updates = []
  const params = []

  if (title !== undefined) {
    updates.push("title = @1")
    params.push(title)
  }
  if (order !== undefined) {
    updates.push("order = @2")
    params.push(order)
  }

  if (updates.length > 0) {
    const query = `UPDATE positions SET ${updates.join(", ")} WHERE positionId=@0`
    this.sql.exec(query, id, ...params)
  }
}

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
}
