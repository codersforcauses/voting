import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { usersTable } from "./schema";

export function getUserList(this: VotingObject) {
  return this.db.select().from(usersTable);
}

export function getUser(this: VotingObject, id: string) {
  return this.db.select().from(usersTable).where(eq(usersTable.id, id));
}

export function insertUser(
  this: VotingObject,
  data: typeof usersTable.$inferInsert
) {
  this.db.insert(usersTable).values(data);
}

export function updateUser(
  this: VotingObject,
  id: string,
  data: Partial<Omit<typeof usersTable.$inferInsert, "id">>
) {
  this.db.update(usersTable).set(data).where(eq(usersTable.id, id));
}

export function deleteUser(this: VotingObject, id: string) {
  this.db.delete(usersTable).where(eq(usersTable.id, id));
}
