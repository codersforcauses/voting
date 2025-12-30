import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable, seatsTable } from "@/db/schema";

export { usersTable };

export function countUsers() {
  return db.$count(usersTable);
}

export function getAllUsers() {
  return db
    .select()
    .from(usersTable)
    .leftJoin(seatsTable, eq(usersTable.seat_id, seatsTable.id));
}

export function getUser(id: string) {
  return db.select().from(usersTable).where(eq(usersTable.id, id));
}

export function getUserByEmail(email: string) {
  return db.select().from(usersTable).where(eq(usersTable.email, email));
}

export function insertUser(
  data: typeof usersTable.$inferInsert
) {
  return db.insert(usersTable).values(data).returning();
}

export function updateUser(
  id: string,
  data: Partial<typeof usersTable.$inferInsert>
) {
  return db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();
}

export function deleteUser(id: string) {
  return db.delete(usersTable).where(eq(usersTable.id, id)).returning();
}
