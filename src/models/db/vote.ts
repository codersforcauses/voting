import { and, eq } from "drizzle-orm";
import { VotingObject } from "../..";
import {
  racesTable,
  votesTable,
  votePreferencesTable,
  positionsTable,
} from "../schema";

export function countVotesForRace(this: VotingObject, race: number) {
  return this.db.$count(votesTable, eq(votesTable.race_id, race));
}

export function getAllVotesForRace(this: VotingObject, race: number) {
  return this.db.select().from(votesTable).where(eq(racesTable.id, race));
}

export function getAllVotesByUser(this: VotingObject, user_id: string) {
  return this.db
    .select()
    .from(votesTable)
    .where(eq(votesTable.user_id, user_id));
}

export function getVoteByUserAndRace(
  this: VotingObject,
  user_id: string,
  race_id: number
) {
  return this.db
    .select()
    .from(votesTable)
    .where(
      and(eq(votesTable.user_id, user_id), eq(votesTable.race_id, race_id))
    )
    .get();
}

export function insertVote(
  this: VotingObject,
  data: Omit<typeof votesTable.$inferInsert, "id">
) {
  return this.db.insert(votesTable).values(data).returning().get();
}

export function updateVote(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof votesTable.$inferInsert, "id">>
) {
  return this.db
    .update(votesTable)
    .set(data)
    .where(eq(votesTable.id, id))
    .returning();
}

export function getVoteAggregateForRace(this: VotingObject, id: number) {
  const votesWithPreferences = this.db
    .select()
    .from(votesTable)
    .where(eq(votesTable.race_id, id))
    .leftJoin(
      votePreferencesTable,
      eq(votesTable.id, votePreferencesTable.vote_id)
    )
    .all();

  return votesWithPreferences.reduce(reduceFunction, {});
}

export function deleteVote(this: VotingObject, id: number) {
  return this.db.delete(votesTable).where(eq(votesTable.id, id)).returning();
}

const reduceFunction = (
  acc: FormattedVoteWithPreference,
  curr: VoteWithPreference
) => {
  const votes = curr.votes;
  const vote_preferences = curr.vote_preferences;

  if (!acc[votes.user_id]) {
    acc[votes.user_id] = { votes, preferences: [] };
  }

  if (vote_preferences) {
    acc[votes.user_id].preferences.push({
      candidate_id: vote_preferences.candidate_id,
      preference: vote_preferences.preference,
    });
  }

  return acc;
};

type VoteWithPreference = {
  votes: {
    id: number;
    user_id: string;
    race_id: number;
    created_at: Date;
    updated_at: Date | null;
  };
  vote_preferences: {
    vote_id: number;
    candidate_id: number;
    preference: number;
  } | null;
};

type FormattedVoteWithPreference = Record<
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
