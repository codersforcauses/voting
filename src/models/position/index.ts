import { VotingObject } from '..'
import { positionsTable } from './schema'
import { eq } from 'drizzle-orm'

export function getAllPositions(
  this: VotingObject
) {
  this.db.select().from(positionsTable)
} 

export function getPosition(
  this: VotingObject, 
  id: number
) {
  this.db.select().from(positionsTable).where(eq(positionsTable.id, id))
}

export function insertPosition(
  this: VotingObject,
  data: Omit<typeof positionsTable.$inferInsert, "id">
) {
  this.db.insert(positionsTable).values(data)
}

export function deletePosition(
  this: VotingObject, 
  id: number
) {
  this.db.delete(positionsTable).where(eq(positionsTable.id, id))
}

export function updatePosition(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof positionsTable.$inferInsert, "id">>
) {
  this.db.update(positionsTable).set(data).where(eq(positionsTable.id, id))
}
