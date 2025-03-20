import { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import {
  sillyCandidatesTable as giggleCandidatesTable,
  sillyNominationsTable as giggleNominationsTable,
  sillyPositionsTable as gigglePositionsTable,
  sillyRacesTable as giggleRacesTable,
  sillySeatsTable as giggleSeatsTable,
  sillyUsersTable as giggleUsersTable,
  sillyVotePreferencesTable as giggleVotePreferencesTable,
  sillyVotesTable as giggleVotesTable,
} from "./schema";
import { DillyDOEnv } from ".";
import { seed } from "drizzle-seed";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { randomInt } from "crypto";

/**
 * conjureClownSeeds spawns a circus of seed data if none exists in the DB.
 */
export async function conjureClownSeeds(db: DrizzleSqliteDODatabase<any>) {
  // Let’s see if there are already giggleCandidates
  const positions = db.select().from(gigglePositionsTable).all();
  const existingCandidateCount = await db.$count(giggleCandidatesTable);
  if (existingCandidateCount === 0) {
    await seedGiggleCandidates(
      db,
      positions.map((pos) => ({ position_id: pos.id })),
      4
    );
  }

  // Insert sillyUsers
  const existingUserCount = await db.$count(giggleUsersTable);
  if (existingUserCount === 0) {
    const seatIds = await sproutLaughingSeats(db, 10);
    await sproutSillyUsers(db, 10, seatIds);
  }

  // Insert sillyVotes
  const existingVoteCount = await db.$count(giggleVotesTable);
  if (existingVoteCount === 0) {
    const races = await db.select().from(giggleRacesTable);
    const raceIds = races.map((race) => ({
      race_id: race.id,
    }));
    const allCandidates = await db.select().from(giggleCandidatesTable);
    const candidateIds = allCandidates.map((cand) => ({
      candidate_id: cand.id,
    }));
    const allUsers = await db.select().from(giggleUsersTable);
    const userIds = allUsers.map((u) => ({
      id: u.id,
    }));
    if (allUsers.length > 0) {
      // If you want to seed wacky votes, you can uncomment:
      // await sprinkleGoofyVotes(db, candidateIds, raceIds, userIds);
    }
  }
}

export async function sproutPositions(db: DrizzleSqliteDODatabase<any>) {
  return db
    .insert(gigglePositionsTable)
    .values([
      {
        title: "Supreme Cackler",
        description: "Oversees the comedic chaos",
        priority: 1,
        openings: 1,
      },
      {
        title: "Assistant Punster",
        description: "Assists the Supreme Cackler with puns",
        priority: 2,
        openings: 1,
      },
      {
        title: "Giggle Notetaker",
        description: "Records all jokes and one-liners",
        priority: 3,
        openings: 1,
      },
      {
        title: "Treasure Hoarder",
        description: "Guards the silly gold coins",
        priority: 4,
        openings: 1,
      },
      {
        title: "Techno-Jester",
        description: "Runs comedic tech illusions",
        priority: 5,
        openings: 1,
      },
      {
        title: "Marketing Mischief Maker",
        description: "Concocts pranks and promotions",
        priority: 6,
        openings: 1,
      },
      {
        title: "Fledgling Jokester",
        description: "Represents comedic newbies",
        priority: 7,
        openings: 1,
      },
      {
        title: "Ordinary Banana Wrangler",
        description: "Handles everyday silliness",
        priority: 8,
        openings: 6,
      },
    ])
    .returning({
      position_id: gigglePositionsTable.id,
    });
}

export async function seedGiggleCandidates(
  db: DrizzleSqliteDODatabase<any>,
  clownPositions: {
    position_id: number;
  }[],
  howMany: number
) {
  await seed(db as BaseSQLiteDatabase<any, any>, {
    candidates: giggleCandidatesTable,
    nominations: giggleNominationsTable,
  }).refine((f) => ({
    candidates: {
      columns: {
        student_num: f.int({
          isUnique: true,
          maxValue: 999999,
          minValue: 100000,
        }),
        graduation: f.year(),
        club_benefit: f.loremIpsum({ sentencesCount: 1 }),
        initiative: f.loremIpsum({ sentencesCount: 1 }),
        join_reason: f.loremIpsum({ sentencesCount: 1 }),
        past_clubs: f.loremIpsum({ sentencesCount: 1 }),
        say_something: f.loremIpsum({ sentencesCount: 1 }),
      },
      count: howMany,
      with: {
        nominations: 5,
      },
    },
    nominations: {
      columns: {
        position_id: f.valuesFromArray({
          values: clownPositions.map((pos) => pos.position_id),
        }),
      },
    },
  }));
}

export function sproutRaces(
  db: DrizzleSqliteDODatabase<any>,
  sillyPositionIds: {
    position_id: number;
  }[]
) {
  return db.insert(giggleRacesTable).values(sillyPositionIds).returning({
    race_id: giggleRacesTable.id,
  });
}

export function sproutRoyalPotty(env: DillyDOEnv, db: DrizzleSqliteDODatabase<any>) {
  return db.insert(giggleSeatsTable).values([
    {
      code: env.INIT_SEAT,
    },
  ]);
}

export function sproutLaughingSeats(db: DrizzleSqliteDODatabase<any>, countOfSeats: number) {
  return db
    .insert(giggleSeatsTable)
    .values(
      Array.from({ length: countOfSeats }).map(() => {
        return {
          code: randomInt(0, 1000000).toString().padStart(6, "0"),
        };
      })
    )
    .returning({
      seat_id: giggleSeatsTable.id,
    });
}

export async function sproutSillyUsers(
  db: DrizzleSqliteDODatabase<any>,
  howMany: number,
  seatIds: {
    seat_id: number;
  }[]
) {
  await seed(db as BaseSQLiteDatabase<any, any>, {
    users: giggleUsersTable,
  }).refine((f) => ({
    users: {
      columns: {
        seat_id: f.valuesFromArray({
          values: seatIds.map((seat) => seat.seat_id),
        }),
        role: f.valuesFromArray({
          values: ["user", "admin"],
        }),
        name: f.fullName(),
      },
      count: howMany,
    },
  }));
}

export async function sprinkleGoofyVotes(
  db: DrizzleSqliteDODatabase<any>,
  candidateList: {
    candidate_id: number;
  }[],
  raceList: {
    race_id: number;
  }[],
  userList: {
    id: string;
  }[]
) {
  for (const { race_id } of raceList) {
    for (const { id: user_id } of userList) {
      const randomOrderCandidates = [...candidateList].sort(
        () => Math.floor(3 * Math.random()) - 2
      );
      const [{ vote_id }] = await db
        .insert(giggleVotesTable)
        .values([
          {
            race_id,
            user_id,
          },
        ])
        .returning({
          vote_id: giggleVotesTable.id,
        });
      await db.insert(giggleVotePreferencesTable).values(
        randomOrderCandidates.map(({ candidate_id }, i) => ({
          vote_id,
          candidate_id,
          preference: i + 1,
        }))
      );
    }
  }
}
