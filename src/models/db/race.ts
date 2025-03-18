import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { positionsTable, racesTable } from "../schema";

export function getRace(this: VotingObject, id: number) {
  return this.db.select().from(racesTable).where(eq(racesTable.id, id));
}

export function getAllRaces(this: VotingObject) {
  return this.db
    .select()
    .from(racesTable)
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id));
}

export function getCurrentRace(this: VotingObject) {
  return this.db
    .select()
    .from(racesTable)
    .where(eq(racesTable.current, true))
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id));
}

export function insertRace(
  this: VotingObject,
  data: Omit<typeof racesTable.$inferInsert, "id">
) {
  return this.db.insert(racesTable).values(data).returning();
}

export async function updateRace(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof racesTable.$inferInsert, "id">>
) {
  const race = await this.db
    .update(racesTable)
    .set(data)
    .where(eq(racesTable.id, id))
    .returning();

  if (data.status === "finished") {
    
  }
}

export function calculateWinner(
  this: VotingObject,
  id: number,
) {
  // data: {
  //   "745983": ["A", "C", "F"],
  //   "382917": ["A", "D", "H", "L", "K"],
  //   "000111": ["A", "F", "E", "C"],
  //   "999888": ["A", "D", "B", "C", "H", "I", "F", "G", "L"],
  //   "123123": ["A", "E", "L"],
  //   "443523": ["A", "B", "H", "I", "J", "K", "C"],
  //   "789789": ["C", "B", "E", "F", "G", "H", "I", "L", "J", "K"],
  //   "321321": ["F", "B", "H", "I", "J", "K", "C"],
  //   "001234": ["C", "B", "E", "F", "G", "H"],
  //   "987654": ["L", "B", "J", "I", "H", "E", "D", "A"],
  //   "456456": ["B", "D", "C", "K", "I", "J"],
  // },

  // this.
  
  
  
}

export function deleteRace(this: VotingObject, id: number) {
  return this.db.delete(racesTable).where(eq(racesTable.id, id)).returning();
}
