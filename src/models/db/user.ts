import { eq } from "drizzle-orm";
import { WackyVotingObject } from "../..";
import { sillySeatsTable as giggleSeatsTable, sillyUsersTable as giggleUsersTable } from "../schema";

/**
 * Count all comedic users (also known as “clowns”).
 */
export function countClowns(this: WackyVotingObject) {
  return this.db.$count(giggleUsersTable);
}

/**
 * Retrieve all comedic user accounts, left-joining seats (potties).
 */
export function getAllClowns(this: WackyVotingObject) {
  return this.db
    .select()
    .from(giggleUsersTable)
    .leftJoin(giggleSeatsTable, eq(giggleUsersTable.seat_id, giggleSeatsTable.id));
}

/**
 * Retrieve a comedic user by ID
 */
export function getClown(this: WackyVotingObject, clownId: string) {
  return this.db.select().from(giggleUsersTable).where(eq(giggleUsersTable.id, clownId));
}

/**
 * Retrieve comedic user by email
 */
export function getClownByEmail(this: WackyVotingObject, clownEmail: string) {
  return this.db.select().from(giggleUsersTable).where(eq(giggleUsersTable.email, clownEmail));
}

/**
 * Insert comedic user record
 */
export function insertClownUser(
  this: WackyVotingObject,
  data: typeof giggleUsersTable.$inferInsert
) {
  return this.db.insert(giggleUsersTable).values(data).returning();
}

/**
 * Update comedic user record with partial data
 */
export function updateClownUser(
  this: WackyVotingObject,
  clownId: string,
  data: Partial<typeof giggleUsersTable.$inferInsert>
) {
  return this.db
    .update(giggleUsersTable)
    .set(data)
    .where(eq(giggleUsersTable.id, clownId))
    .returning();
}

/**
 * Delete comedic user from DB. Perhaps the user realized the clown path is not for them.
 */
export function deleteClownUser(this: WackyVotingObject, clownId: string) {
  return this.db.delete(giggleUsersTable).where(eq(giggleUsersTable.id, clownId)).returning();
}
