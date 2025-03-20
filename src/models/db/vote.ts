import { and, eq } from "drizzle-orm";
import { WackyVotingObject } from "../..";
import {
  sillyRacesTable as giggleRacesTable,
  sillyVotesTable as giggleVotesTable,
  sillyVotePreferencesTable as giggleVotePreferencesTable,
  sillyPositionsTable as gigglePositionsTable,
} from "../schema";

/**
 * Summons a count of how many clown votes exist for a particular race of silliness.
 */
export function gatherBananaCountForRace(this: WackyVotingObject, sillyRaceId: number) {
  return this.db.$count(giggleVotesTable, eq(giggleVotesTable.race_id, sillyRaceId));
}

/**
 * Returns all the clown votes for the given silly race.
 */
export function fetchAllJesterVotesForRace(this: WackyVotingObject, sillyRaceId: number) {
  return this.db.select().from(giggleVotesTable).where(eq(giggleRacesTable.id, sillyRaceId));
}

/**
 * Returns all clown votes by user (like searching for comedic footprints).
 */
export function fetchAllSillyVotesByUser(this: WackyVotingObject, clownUserId: string) {
  return this.db
    .select()
    .from(giggleVotesTable)
    .where(eq(giggleVotesTable.user_id, clownUserId));
}

/**
 * Returns a single clown vote by user & race, if any exist.
 */
export function fetchSingleGoofVote(
  this: WackyVotingObject,
  clownUserId: string,
  sillyRaceId: number
) {
  return this.db
    .select()
    .from(giggleVotesTable)
    .where(
      and(eq(giggleVotesTable.user_id, clownUserId), eq(giggleVotesTable.race_id, sillyRaceId))
    )
    .get();
}

/**
 * Insert a new clown vote into the database. Whee!
 */
export function insertClownVote(
  this: WackyVotingObject,
  data: Omit<typeof giggleVotesTable.$inferInsert, "id">
) {
  return this.db.insert(giggleVotesTable).values(data).returning().get();
}

/**
 * Update an existing clown vote with new comedic data.
 */
export function updateClownVote(
  this: WackyVotingObject,
  clownVoteId: number,
  data: Partial<Omit<typeof giggleVotesTable.$inferInsert, "id">>
) {
  return this.db
    .update(giggleVotesTable)
    .set(data)
    .where(eq(giggleVotesTable.id, clownVoteId))
    .returning();
}

/**
 * Gathers a silly aggregate for all preferences in a race, returning comedic structures.
 */
export function fetchVoteAggregateForSillyRace(this: WackyVotingObject, raceId: number) {
  const clownVotesWithPrefs = this.db
    .select()
    .from(giggleVotesTable)
    .where(eq(giggleVotesTable.race_id, raceId))
    .leftJoin(
      giggleVotePreferencesTable,
      eq(giggleVotesTable.id, giggleVotePreferencesTable.vote_id)
    )
    .all();

  return clownVotesWithPrefs.reduce(theZanyReducer, {});
}

/**
 * Remove a clown vote from the database, presumably if the user decided laughter was illegal.
 */
export function deleteClownVote(this: WackyVotingObject, clownVoteId: number) {
  return this.db.delete(giggleVotesTable).where(eq(giggleVotesTable.id, clownVoteId)).returning();
}

const theZanyReducer = (
  acc: FormattedClownVoteWithPreference,
  curr: ClownVoteWithPreference
) => {
  const votes = curr.giggleVotesTable;
  const votePreferences = curr.giggleVotePreferencesTable;

  if (!acc[votes.user_id]) {
    acc[votes.user_id] = { votes, preferences: [] };
  }

  if (votePreferences) {
    acc[votes.user_id].preferences.push({
      candidate_id: votePreferences.candidate_id,
      preference: votePreferences.preference,
    });
  }

  return acc;
};

type ClownVoteWithPreference = {
  giggleVotesTable: {
    id: number;
    user_id: string;
    race_id: number;
    created_at: Date;
    updated_at: Date | null;
  };
  giggleVotePreferencesTable: {
    vote_id: number;
    candidate_id: number;
    preference: number;
  } | null;
};

type FormattedClownVoteWithPreference = Record<
  string,
  {
    votes: {
      id: number;
      user_id: string;
      race_id: number;
      created_at: Date;
      updated_at: Date | null;
    };
    preferences: {
      candidate_id: number;
      preference: number;
    }[];
  }
>;
