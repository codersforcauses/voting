import { and, eq } from "drizzle-orm";
import { VotingObject } from "..";
import { votePreferencesTable } from "../schema";

export function getAllVotePreferences(this: VotingObject) {
  return this.db.select().from(votePreferencesTable);
}

export function getVotePreference(
  this: VotingObject,
  vote_id: number,
  candidate_id: number
) {
  return this.db
    .select()
    .from(votePreferencesTable)
    .where(
      and(
        eq(votePreferencesTable.vote_id, vote_id),
        eq(votePreferencesTable.candidate_id, candidate_id)
      )
    );
}

export function getVotePreferencesForVote(this: VotingObject, vote_id: number) {
  return this.db
    .select()
    .from(votePreferencesTable)
    .where(eq(votePreferencesTable.vote_id, vote_id));
}

export function insertVotePreference(
  this: VotingObject,
  data: Omit<typeof votePreferencesTable.$inferInsert, "id">
) {
  return this.db
    .insert(votePreferencesTable)
    .values(data)
    .onConflictDoUpdate({
      target: [votePreferencesTable.vote_id, votePreferencesTable.candidate_id],
      set: {
        preference: data.preference,
      },
    })
    .returning();
}

export function updateVotePreference(
  this: VotingObject,
  vote_id: number,
  candidate_id: number,
  data: Partial<Omit<typeof votePreferencesTable.$inferInsert, "id">>
) {
  return this.db
    .update(votePreferencesTable)
    .set(data)
    .where(
      and(
        eq(votePreferencesTable.vote_id, vote_id),
        eq(votePreferencesTable.candidate_id, candidate_id)
      )
    )
    .returning();
}

export function deleteVotePreference(
  this: VotingObject,
  vote_id: number,
  candidate_id: number
) {
  return this.db
    .delete(votePreferencesTable)
    .where(
      and(
        eq(votePreferencesTable.vote_id, vote_id),
        eq(votePreferencesTable.candidate_id, candidate_id)
      )
    )
    .returning();
}
