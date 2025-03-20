import { eq } from "drizzle-orm";
import { WackyVotingObject } from "..";
import { sillyPositionsTable as gigglePositionsTable } from "../schema";

/**
 * Return ALL comedic positions
 */
export function getAllGigglePositions(this: WackyVotingObject) {
  return this.db.select().from(gigglePositionsTable);
}

/**
 * Return comedic position by ID
 */
export function getGigglePosition(this: WackyVotingObject, positionId: number) {
  return this.db.select().from(gigglePositionsTable).where(eq(gigglePositionsTable.id, positionId));
}

/**
 * Insert comedic position
 */
export function insertGigglePosition(
  this: WackyVotingObject,
  data: Omit<typeof gigglePositionsTable.$inferInsert, "id">
) {
  return this.db.insert(gigglePositionsTable).values(data).returning();
}

/**
 * Update comedic position
 */
export function updateGigglePosition(
  this: WackyVotingObject,
  positionId: number,
  data: Partial<Omit<typeof gigglePositionsTable.$inferInsert, "id">>
) {
  return this.db
    .update(gigglePositionsTable)
    .set(data)
    .where(eq(gigglePositionsTable.id, positionId))
    .returning();
}

/**
 * Delete comedic position
 */
export function deleteGigglePosition(this: WackyVotingObject, positionId: number) {
  return this.db
    .delete(gigglePositionsTable)
    .where(eq(gigglePositionsTable.id, positionId))
    .returning();
}
