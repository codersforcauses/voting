import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { racesTable } from "./schema";

export function getRace(this: VotingObject, id: number) {
  return this.db.select().from(racesTable).where(eq(racesTable.id, id));
}

export function insertRace(
  this: VotingObject,
  data: Omit<typeof racesTable.$inferInsert, "id">
) {
  this.db.insert(racesTable).values(data);
}

export function updateRace(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof racesTable.$inferInsert, "id">>
) {
  this.db.update(racesTable).set(data).where(eq(racesTable.id, id));
}

export function deleteRace(this: VotingObject, id: number) {
  this.db.delete(racesTable).where(eq(racesTable.id, id));
}
