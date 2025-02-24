import tableQuery from './table.sql'
import seedQuery from './seed.sql'
import { VotingObject } from '..'
import { z } from 'zod'
import { positionsTable } from './schema'
import { eq } from 'drizzle-orm'

export function getAllPositions(this: VotingObject) {
  this.db.select().from(positionsTable)
} 

export function getPosition(this: VotingObject, id: string) {
  this.db.select().from(positionsTable).where(eq(positionsTable.id, id))
}

export const createSchema = z.object({
  title: z.string(),
  order: z.number(),
})

export function createPosition(this: VotingObject, { title, order }: z.infer<typeof createSchema>) {

} 

export function deletePosition(this: VotingObject, id: string) {

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
  
}

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
}
