import { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import {
  candidatesTable,
  nominationsTable,
  positionsTable,
  racesTable,
  seatsTable,
} from "./schema";
import { DOEnv } from ".";
import { seed } from "drizzle-seed";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

export function seedPositions(db: DrizzleSqliteDODatabase<any>) {
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

export function seedRaces(
  db: DrizzleSqliteDODatabase<any>,
  values: {
    position_id: number;
  }[]
) {
  return db.insert(racesTable).values(values);
}

export function seedSeat(env: DOEnv, db: DrizzleSqliteDODatabase<any>) {
  return db.insert(seatsTable).values([
    {
      code: env.DEFAULT_SEAT,
    },
  ]);
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
