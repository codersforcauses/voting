import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { usersTable } from "./schema";

export function getAllUsers(this: VotingObject) {
  return this.db.select().from(usersTable);
}

export function getUser(this: VotingObject, id: number) {
  return this.db.select().from(usersTable).where(eq(usersTable.id, id));
}

export function insertUser(
  this: VotingObject,
  data: typeof usersTable.$inferInsert
) {
  return this.db.insert(usersTable).values(data).returning();
}

export function updateUser(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof usersTable.$inferInsert, "id">>
) {
  return this.db.update(usersTable).set(data).where(eq(usersTable.id, id)).returning();
}

export function deleteUser(this: VotingObject, id: number) {
  return this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
}
