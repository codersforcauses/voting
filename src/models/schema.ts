import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

/**
 * Whoopee seat table (like physical seats, but sillier).
 */
export const sillySeatsTable = sqliteTable("seats", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
});

export const sillySeatRelations = relations(sillySeatsTable, ({ one }) => ({
  users: one(() => sillyUsersTable),
}));

/**
 * Comedic users table
 */
export const sillyUsersTable = sqliteTable(
  "users",
  {
    id: text().primaryKey(),
    email: text().notNull().unique(),
    preferred_name: text().notNull(),
    name: text().notNull(),
    student_num: text().unique(),
    role: text({ enum: ["user", "admin"] }).default("user"),
    seat_id: int("seat_id")
      .references(() => sillySeatsTable.id)
      .unique(),
  },
  (usersTable) => [index("seat_idx").on(usersTable.seat_id)]
);

export const sillyUserRelations = relations(sillyUsersTable, ({ one }) => ({
  seats: one(sillySeatsTable),
}));

/**
 * Comedic candidates table
 */
export const sillyCandidatesTable = sqliteTable("candidates", {
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

export const sillyCandidateRelations = relations(sillyCandidatesTable, ({ many }) => ({
  nominations: many(() => sillyNominationsTable),
  votePreferences: many(() => sillyVotePreferencesTable),
}));

/**
 * Comedic positions table
 */
export const sillyPositionsTable = sqliteTable("positions", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  priority: int({ mode: "number" }).notNull().unique(),
  openings: int({ mode: "number" }).notNull().default(1),
});

export const sillyPositionRelations = relations(sillyPositionsTable, ({ many }) => ({
  nominations: many(() => sillyNominationsTable),
  races: many(() => sillyRacesTable),
}));

/**
 * Comedic nominations table
 */
export const sillyNominationsTable = sqliteTable(
  "nominations",
  {
    candidate_id: int("candidate_id")
      .references(() => sillyCandidatesTable.id, { onDelete: "cascade" })
      .notNull(),
    position_id: int("position_id")
      .references(() => sillyPositionsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.candidate_id, table.position_id],
    }),
  ]
);

export const sillyNominationRelations = relations(sillyNominationsTable, ({ one }) => ({
  candidates: one(sillyCandidatesTable, {
    fields: [sillyNominationsTable.candidate_id],
    references: [sillyCandidatesTable.id],
  }),
  positions: one(sillyPositionsTable, {
    fields: [sillyNominationsTable.position_id],
    references: [sillyPositionsTable.id],
  }),
}));

/**
 * Comedic races table
 */
export const sillyRacesTable = sqliteTable("race", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  position_id: int("position_id")
    .references(() => sillyPositionsTable.id, { onDelete: "cascade" })
    .notNull(),
  status: text({
    enum: ["closed", "open", "finished"],
  }).default("closed"),
  current: int({ mode: "boolean" }).default(false),
});

export const sillyRacesRelations = relations(sillyRacesTable, ({ one, many }) => ({
  positions: one(sillyPositionsTable, {
    fields: [sillyRacesTable.position_id],
    references: [sillyPositionsTable.id],
  }),
  votes: many(() => sillyVotesTable),
}));

/**
 * Comedic votes table
 */
export const sillyVotesTable = sqliteTable("votes", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  user_id: text("user_id")
    .references(() => sillyUsersTable.id)
    .notNull(),
  race_id: int("race_id")
    .references(() => sillyRacesTable.id)
    .notNull(),
  created_at: int({ mode: "timestamp_ms" })
    .$default(() => new Date())
    .notNull(),
  updated_at: int({ mode: "timestamp_ms" }).$onUpdate(() => new Date()),
});

export const sillyVotesRelations = relations(sillyVotesTable, ({ one, many }) => ({
  races: one(sillyRacesTable, {
    fields: [sillyVotesTable.race_id],
    references: [sillyRacesTable.id],
  }),
  votePreferences: many(() => sillyVotePreferencesTable),
}));

/**
 * Comedic vote preferences table
 */
export const sillyVotePreferencesTable = sqliteTable(
  "vote_preferences",
  {
    vote_id: int("vote_id")
      .references(() => sillyVotesTable.id)
      .notNull(),
    candidate_id: int("candidate_id")
      .references(() => sillyCandidatesTable.id, { onDelete: "cascade" })
      .notNull(),
    preference: int({ mode: "number" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.candidate_id, t.vote_id],
    }),
    check("preference_check", sql`${t.preference} >= 0`),
  ]
);

export const sillyVotePreferencesRelations = relations(
  sillyVotePreferencesTable,
  ({ one }) => ({
    votes: one(sillyVotesTable, {
      fields: [sillyVotePreferencesTable.vote_id],
      references: [sillyVotesTable.id],
    }),
    candidate: one(sillyCandidatesTable, {
      fields: [sillyVotePreferencesTable.vote_id],
      references: [sillyCandidatesTable.id],
    }),
  })
);

/**
 * Comedic elected table
 */
export const sillyElectedTable = sqliteTable(
  "elected",
  {
    candidate_id: int("candidate_id")
      .references(() => sillyCandidatesTable.id, { onDelete: "cascade" })
      .notNull(),
    race_id: int("race_id")
      .references(() => sillyRacesTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.candidate_id, table.race_id],
    }),
  ]
);

export const sillyElectedRelations = relations(sillyElectedTable, ({ one }) => ({
  candidates: one(sillyCandidatesTable, {
    fields: [sillyElectedTable.candidate_id],
    references: [sillyCandidatesTable.id],
  }),
  races: one(sillyRacesTable, {
    fields: [sillyElectedTable.race_id],
    references: [sillyRacesTable.id],
  }),
}));
