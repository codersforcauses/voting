import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { racesTable } from "./schema";

export function getRace(this: VotingObject, id: number) {
  return this.db.select().from(racesTable).where(eq(racesTable.id, id));
}

export function getAllRaces(this: VotingObject) {
  return this.db.select().from(racesTable);
}

export function insertRace(
  this: VotingObject,
  data: Omit<typeof racesTable.$inferInsert, "id">
) {
  return this.db.insert(racesTable).values(data).returning();
}

export function updateRace(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof racesTable.$inferInsert, "id">>
) {
  return this.db.update(racesTable).set(data).where(eq(racesTable.id, id)).returning();
}

export function deleteRace(this: VotingObject, id: number) {
  return this.db.delete(racesTable).where(eq(racesTable.id, id)).returning();
}
