import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  int,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const seatTable = sqliteTable("seats", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text().notNull().unique(),
});

export const usersTable = sqliteTable("users", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  preferred_name: text().notNull(),
  name: text().notNull(),
  student_num: text().notNull().unique(),
  role: text({ enum: ["user", "admin"] }).default("user"),
  seat_id: int("seats")
    .references(() => seatTable.id)
    .notNull(),
});

export const candidatesTable = sqliteTable("candidates", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  isMember: int({ mode: "boolean" }).notNull(),
  name: text().notNull(),
  email: text().notNull().unique(),
  student_num: text().notNull().unique(),
  graduation: text().notNull(),
  join_reason: text().notNull(),
  club_benefit: text().notNull(),
  initiative: text().notNull(),
  other_clubs: text().notNull(),
  past_clubs: text().notNull(),
  attend: int({ mode: "boolean" }).notNull(),
  say_something: text(),
});

export const positionsTable = sqliteTable("positions", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  priority: int({ mode: "number" }).notNull().unique(),
  openings: int({ mode: "number" }).notNull().default(1),
});

export const nominationsTable = sqliteTable(
  "nominations",
  {
    candidate_id: int("candidate_id"),
    position_id: int("position_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.candidate_id],
      foreignColumns: [candidatesTable.id],
    }).onDelete("cascade"),
  ]
);

export const racesTable = sqliteTable("race", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  position_id: int("positions")
    .references(() => positionsTable.id)
    .notNull(),
  status: text({ enum: ["closed", "open", "completed"] }).default("closed"),
});

export const votesTable = sqliteTable("votes", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  user_id: int("users")
    .references(() => usersTable.id)
    .notNull(),
  race_id: int("races")
    .references(() => racesTable.id)
    .notNull(),
  created_at: int({ mode: "timestamp_ms" })
    .$default(() => new Date())
    .notNull(),
  updated_at: int({ mode: "timestamp_ms" }).$onUpdate(() => new Date()),
});

// Needs unique constraint on vote_id->preference
export const votePreferencesTable = sqliteTable(
  "vote_preferences",
  {
    vote_id: int("votes")
      .references(() => votesTable.id)
      .notNull(),
    candidate_id: int("candidates")
      .references(() => candidatesTable.id)
      .notNull(),
    preference: int({ mode: "number" }).notNull(),
  },
  (t) => [
    unique().on(t.vote_id, t.preference),
    check("preference_check", sql`${t.preference} > 0`), // Votes start from 1 for first-preference
  ]
);
