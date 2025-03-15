import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { positionsTable } from "./schema";

export function getAllPositions(this: VotingObject) {
  return this.db.select().from(positionsTable);
}

export function getPosition(this: VotingObject, id: number) {
  return this.db.select().from(positionsTable).where(eq(positionsTable.id, id));
}

export function insertPosition(
  this: VotingObject,
  data: Omit<typeof positionsTable.$inferInsert, "id">
) {
  return this.db.insert(positionsTable).values(data).returning();
}

export function updatePosition(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof positionsTable.$inferInsert, "id">>
) {
  return this.db.update(positionsTable).set(data).where(eq(positionsTable.id, id)).returning();
}

export function deletePosition(this: VotingObject, id: number) {
  return this.db.delete(positionsTable).where(eq(positionsTable.id, id)).returning();
}
