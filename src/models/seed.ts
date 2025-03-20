import { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import {
  candidatesTable,
  nominationsTable,
  positionsTable,
  racesTable,
  seatsTable,
  usersTable,
  votePreferencesTable,
  votesTable,
} from "./schema";
import { DOEnv } from ".";
import { seed } from "drizzle-seed";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { randomInt } from "crypto";

export async function devSeeds(db: DrizzleSqliteDODatabase<any>) {
  // Seed Positions, Races and Candidates
  const numPositions = await db.$count(positionsTable);
  if (numPositions === 0) {
    const positionIds = await seedPositions(db);
    await seedRaces(db, positionIds);
    await seedCandidate(db, positionIds);
  }

  // Seed Users
  const numUsers = await db.$count(usersTable);
  if (numUsers === 0) {
    const seatIds = await seedSeats(db, 10);
    await seedUsers(db, 10, seatIds);
  }

  // Seed Votes
  const numVotes = await db.$count(votesTable);
  if (numVotes === 0) {
    const races = await db.select().from(racesTable);
    const raceIds = races.map((race) => ({
      race_id: race.id,
    }));
    const candidates = await db.select().from(candidatesTable);
    const candidateIds = candidates.map((candidate) => ({
      candidate_id: candidate.id,
    }));
    const users = await db.select().from(usersTable);
    const user_ids = users.map((user) => ({
      id: user.id,
    }));
    if (users.length > 0) {
      // await seedVote(db, candidateIds, raceIds, user_ids);
    }
  }
}

export async function seedPositions(db: DrizzleSqliteDODatabase<any>) {
  return db
    .insert(positionsTable)
    .values([
      {
        title: "President",
        description: "Runs the club",
        priority: 1,
        openings: 1,
      },
      {
        title: "Vice President",
        description: "Assists the President",
        priority: 2,
        openings: 1,
      },
      {
        title: "Secretary",
        description: "Keeps minutes of meetings",
        priority: 3,
        openings: 1,
      },
      {
        title: "Treasurer",
        description: "Manages club finances",
        priority: 4,
        openings: 1,
      },
      {
        title: "Technical Lead",
        description: "Oversees technical projects",
        priority: 5,
        openings: 1,
      },
      {
        title: "Marketing Officer",
        description: "Handles marketing and promotions",
        priority: 6,
        openings: 1,
      },
      {
        title: "Fresher Representative",
        description: "Represents the interests of first year students",
        priority: 7,
        openings: 1,
      },
      {
        title: "Ordinary Committee Member",
        description: "General committee member",
        priority: 8,
        openings: 6,
      },
    ])
    .returning({
      position_id: positionsTable.id,
    });
}

export async function seedCandidate(
  db: DrizzleSqliteDODatabase<any>,
  values: {
    position_id: number;
  }[]
) {
  await seed(db as BaseSQLiteDatabase<any, any>, {
    candidates: candidatesTable,
    nominations: nominationsTable,
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
      count: 4,
      with: {
        nominations: 3,
      },
    },
    nominations: {
      columns: {
        position_id: f.valuesFromArray({
          values: values.map((pos) => pos.position_id),
        }),
      },
    },
  }));
}

export function seedRaces(
  db: DrizzleSqliteDODatabase<any>,
  values: {
    position_id: number;
  }[]
) {
  return db.insert(racesTable).values(values).returning({
    race_id: racesTable.id,
  });
}

export function seedMasterSeat(env: DOEnv, db: DrizzleSqliteDODatabase<any>) {
  return db.insert(seatsTable).values([
    {
      code: env.INIT_SEAT,
    },
  ]);
}

export function seedSeats(db: DrizzleSqliteDODatabase<any>, number: number) {
  return db
    .insert(seatsTable)
    .values(
      Array.from({ length: number }).map(() => {
        return {
          code: randomInt(0, 1000000).toString().padStart(6, "0"),
        };
      })
    )
    .returning({
      seat_id: seatsTable.id,
    });
}

export async function seedUsers(
  db: DrizzleSqliteDODatabase<any>,
  number: number,
  seats: {
    seat_id: number;
  }[]
) {
  await seed(db as BaseSQLiteDatabase<any, any>, {
    users: usersTable,
  }).refine((f) => ({
    users: {
      columns: {
        seat_id: f.valuesFromArray({
          values: seats.map((seat) => seat.seat_id),
        }),
      },
      count: number,
    },
  }));
}

export async function seedVote(
  db: DrizzleSqliteDODatabase<any>,
  candidates: {
    candidate_id: number;
  }[],
  races: {
    race_id: number;
  }[],
  users: {
    id: string;
  }[]
) {
  for (const { race_id } of races) {
    for (const { id: user_id } of users) {
      const randomOrderCandidates = [...candidates].sort(
        () => Math.floor(3 * Math.random()) - 2
      );
      const [{ vote_id }] = await db
        .insert(votesTable)
        .values([
          {
            race_id,
            user_id,
          },
        ])
        .returning({
          vote_id: votesTable.id,
        });
      await db.insert(votePreferencesTable).values(
        randomOrderCandidates.map(({ candidate_id }, i) => ({
          vote_id,
          candidate_id,
          preference: i + 1,
        }))
      );
    }
  }
}
