import { eq } from "drizzle-orm";
import { VotingObject } from "../..";
import { usersTable } from "../schema";

export function countUsers(this: VotingObject) {
  return this.db.$count(usersTable);
}

export function getAllUsers(this: VotingObject) {
  return this.db.select().from(usersTable);
}

export function getUser(this: VotingObject, id: string) {
  return this.db.select().from(usersTable).where(eq(usersTable.id, id));
}

export function getUserByEmail(this: VotingObject, email: string) {
  return this.db.select().from(usersTable).where(eq(usersTable.email, email));
}

export function insertUser(
  this: VotingObject,
  data: typeof usersTable.$inferInsert
) {
  return this.db.insert(usersTable).values(data).returning();
}

export function updateUser(
  this: VotingObject,
  id: string,
  data: Partial<typeof usersTable.$inferInsert>
) {
  return this.db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();
}

export function deleteUser(this: VotingObject, id: string) {
  return this.db.delete(usersTable).where(eq(usersTable.id, id)).returning();
}
