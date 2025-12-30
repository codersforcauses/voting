import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { votesTable, votePreferencesTable, racesTable } from "@/db/schema";

export { votesTable, votePreferencesTable };

export function countVotesForRace(race: number) {
  return db.$count(votesTable, eq(votesTable.race_id, race));
}

export function getAllVotesForRace(race: number) {
  return db.select().from(votesTable).where(eq(racesTable.id, race));
}

export function getAllVotesByUser(user_id: string) {
  return db
    .select()
    .from(votesTable)
    .where(eq(votesTable.user_id, user_id));
}

export function getVoteByUserAndRace(
  user_id: string,
  race_id: number
) {
  return db
    .select()
    .from(votesTable)
    .where(
      and(eq(votesTable.user_id, user_id), eq(votesTable.race_id, race_id))
    )
    .get();
}

export function insertVote(
  data: Omit<typeof votesTable.$inferInsert, "id">
) {
  return db.insert(votesTable).values(data).returning().get();
}

export function updateVote(
  id: number,
  data: Partial<Omit<typeof votesTable.$inferInsert, "id">>
) {
  return db
    .update(votesTable)
    .set(data)
    .where(eq(votesTable.id, id))
    .returning();
}

export function getVoteAggregateForRace(id: number) {
  const votesWithPreferences = db
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

export function getVoteCollatedForRace(id: number) {
  const votesCollated = db.query.votesTable.findMany({
    with: {
      votePreferences: true
    }
  })

  return votesCollated
}

export function deleteVote(id: number) {
  return db.delete(votesTable).where(eq(votesTable.id, id)).returning();
}

export function getAllVotePreferences() {
  return db.select().from(votePreferencesTable);
}

export function getVotePreference(
  vote_id: number,
  candidate_id: number
) {
  return db
    .select()
    .from(votePreferencesTable)
    .where(
      and(
        eq(votePreferencesTable.vote_id, vote_id),
        eq(votePreferencesTable.candidate_id, candidate_id)
      )
    );
}

export function getVotePreferenceForCandidate(
  candidate_id: number
) {
  return db
    .select()
    .from(votePreferencesTable)
    .where(
      and(
        eq(votePreferencesTable.candidate_id, candidate_id)
      )
    );
}

export function getVotePreferencesForVote(vote_id: number) {
  return db
    .select()
    .from(votePreferencesTable)
    .where(eq(votePreferencesTable.vote_id, vote_id));
}

export function insertVotePreference(
  data: Omit<typeof votePreferencesTable.$inferInsert, "id">
) {
  return db
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
  vote_id: number,
  candidate_id: number,
  data: Partial<Omit<typeof votePreferencesTable.$inferInsert, "id">>
) {
  return db
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
  vote_id: number,
  candidate_id: number
) {
  return db
    .delete(votePreferencesTable)
    .where(
      and(
        eq(votePreferencesTable.vote_id, vote_id),
        eq(votePreferencesTable.candidate_id, candidate_id)
      )
    )
    .returning();
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
