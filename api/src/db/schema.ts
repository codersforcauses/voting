import { sql } from "drizzle-orm";
import {
  check,
  integer,
  primaryKey,
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  index
} from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
}

export const seatsTable = pgTable("seats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  code: varchar({ length: 255 }).notNull().unique(),
});

export const usersTable = pgTable("users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar({ length: 255 }).notNull().unique(),
    preferred_name: varchar({ length: 255 }),
    name: varchar({ length: 255 }),
    student_num: varchar({ length: 255 }).unique(),
    role: varchar({ length: 50, enum: ["user", "admin"] }).default("user").notNull(),
    seat_id: integer()
  },
  (usersTable) => [index("seat_idx").on(usersTable.seat_id)]
);

export const positionsTable = pgTable("positions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  priority: integer().notNull().unique(),
  openings: integer().notNull().default(1),
  ...timestamps
});

export const racesTable = pgTable("races", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  position_id: integer(),
  status: varchar({ length: 50, enum: ["closed", "open", "finished"] }).default("closed"),
  current: boolean().default(false),
  tally: text(),
  ...timestamps
});

export const candidatesTable = pgTable("candidates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  isMember: boolean().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  student_num: varchar({ length: 255 }).notNull().unique(),
  graduation: varchar({ length: 255 }).notNull(),
  join_reason: text().notNull(),
  club_benefit: text().notNull(),
  initiative: text().notNull(),
  other_clubs: text().notNull(),
  past_clubs: text().notNull(),
  attend: boolean().notNull(),
  say_something: text(),
  ...timestamps
});

export const nominationsTable = pgTable("nominations",
  {
    candidate_id: integer().notNull(),
    position_id: integer().notNull(),
    ...timestamps
  },
  (table) => [
    primaryKey({
      columns: [table.candidate_id, table.position_id],
    }),
  ]
);

export const votesTable = pgTable("votes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  race_id: integer().notNull(),
  ...timestamps
});

export const votePreferencesTable = pgTable("vote_preferences",
  {
    vote_id: integer().notNull(),
    candidate_id: integer().notNull(),
    preference: integer().notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.candidate_id, t.vote_id],
    }),
    check("preference_check", sql`${t.preference} >= 0`),
  ]
);

export const electedTable = pgTable("elected",
  {
    candidate_id: integer().notNull(),
    race_id: integer().notNull(),
    ...timestamps
  },
  (table) => [
    primaryKey({
      columns: [table.candidate_id, table.race_id],
    }),
  ]
);
