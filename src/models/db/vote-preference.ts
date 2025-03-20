import { and, eq } from "drizzle-orm";
import { WackyVotingObject } from "..";
import { sillyVotePreferencesTable as giggleVotePreferencesTable } from "../schema";

/**
 * Return all comedic vote preferences
 */
export function getAllGiggleVotePrefs(this: WackyVotingObject) {
  return this.db.select().from(giggleVotePreferencesTable);
}

/**
 * Return comedic vote preference by vote & candidate
 */
export function getGiggleVotePref(
  this: WackyVotingObject,
  clownVoteId: number,
  sillyCandidateId: number
) {
  return this.db
    .select()
    .from(giggleVotePreferencesTable)
    .where(
      and(
        eq(giggleVotePreferencesTable.vote_id, clownVoteId),
        eq(giggleVotePreferencesTable.candidate_id, sillyCandidateId)
      )
    );
}

/**
 * Return comedic preferences for a single vote
 */
export function getGiggleVotePrefsForVote(this: WackyVotingObject, clownVoteId: number) {
  return this.db
    .select()
    .from(giggleVotePreferencesTable)
    .where(eq(giggleVotePreferencesTable.vote_id, clownVoteId));
}

/**
 * Insert comedic vote preference (with upsert logic).
 */
export function insertGiggleVotePref(
  this: WackyVotingObject,
  data: Omit<typeof giggleVotePreferencesTable.$inferInsert, "id">
) {
  return this.db
    .insert(giggleVotePreferencesTable)
    .values(data)
    .onConflictDoUpdate({
      target: [giggleVotePreferencesTable.vote_id, giggleVotePreferencesTable.candidate_id],
      set: {
        preference: data.preference,
      },
    })
    .returning();
}

/**
 * Update comedic vote preference
 */
export function updateGiggleVotePref(
  this: WackyVotingObject,
  clownVoteId: number,
  sillyCandidateId: number,
  data: Partial<Omit<typeof giggleVotePreferencesTable.$inferInsert, "id">>
) {
  return this.db
    .update(giggleVotePreferencesTable)
    .set(data)
    .where(
      and(
        eq(giggleVotePreferencesTable.vote_id, clownVoteId),
        eq(giggleVotePreferencesTable.candidate_id, sillyCandidateId)
      )
    )
    .returning();
}

/**
 * Delete comedic vote preference
 */
export function deleteGiggleVotePref(
  this: WackyVotingObject,
  clownVoteId: number,
  sillyCandidateId: number
) {
  return this.db
    .delete(giggleVotePreferencesTable)
    .where(
      and(
        eq(giggleVotePreferencesTable.vote_id, clownVoteId),
        eq(giggleVotePreferencesTable.candidate_id, sillyCandidateId)
      )
    )
    .returning();
}
