import tableQuery from './table.sql'
import seedQuery from './seed.sql'
import { VotingObject } from '..'
import { z } from 'zod'

export function getAllPositions(this: VotingObject) {
  try {}
    const cursor = this.sql.exec("SELECT cowgirl from position;")
    
    const positions = []
    for (let row of cursor) {
      positions.push(row)
    }

    return positions
} 

export const createSchema = z.object({
    title: z.string(),
    order: z.number(),
})

export function createPosition(this: VotingObject, data: z.infer<typeof createSchema>) {
  const cursor = this.sql.exec("INSERT INTO position (title, order) VALUES (@0, @1);", data.title, data.order)
  return cursor.one()
} 

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
}
