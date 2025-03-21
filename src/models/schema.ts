import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const seatsTable = sqliteTable("seats", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
});

export const seatRelations = relations(seatsTable, ({ one }) => ({
  users: one(usersTable),
}));

export const usersTable = sqliteTable(
  "users",
  {
    id: text().primaryKey(),
    email: text().notNull().unique(),
    preferred_name: text().notNull(),
    name: text().notNull(),
    student_num: text().unique(),
    role: text({ enum: ["user", "admin"] }).default("user"),
    seat_id: int("seat_id")
      .references(() => seatsTable.id)
      .unique(),
  },
  (usersTable) => [index("seat_idx").on(usersTable.seat_id)]
);

export const userRelations = relations(usersTable, ({ one }) => ({
  seats: one(seatsTable),
}));

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

export const candidateRelations = relations(candidatesTable, ({ many }) => ({
  nominations: many(nominationsTable),
  votePreferences: many(votePreferencesTable),
}));

export const positionsTable = sqliteTable("positions", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  priority: int({ mode: "number" }).notNull().unique(),
  openings: int({ mode: "number" }).notNull().default(1),
});

export const positionRelations = relations(positionsTable, ({ many }) => ({
  nominations: many(nominationsTable),
  races: many(racesTable),
}));

export const nominationsTable = sqliteTable(
  "nominations",
  {
    candidate_id: int("candidate_id")
      .references(() => candidatesTable.id, { onDelete: "cascade" })
      .notNull(),
    position_id: int("position_id")
      .references(() => positionsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.candidate_id, table.position_id],
    }),
  ]
);

export const nominationRelations = relations(nominationsTable, ({ one }) => ({
  candidates: one(candidatesTable, {
    fields: [nominationsTable.candidate_id],
    references: [candidatesTable.id],
  }),
  positions: one(positionsTable, {
    fields: [nominationsTable.position_id],
    references: [positionsTable.id],
  }),
}));

export const racesTable = sqliteTable("race", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  position_id: int("position_id")
    .references(() => positionsTable.id, { onDelete: "cascade" })
    .notNull(),
  status: text({
    enum: ["closed", "open", "finished"],
  }).default("closed"),
  current: int({ mode: "boolean" }).default(false),
  tally: text(),
});

export const racesRelations = relations(racesTable, ({ one, many }) => ({
  positions: one(positionsTable, {
    fields: [racesTable.position_id],
    references: [positionsTable.id],
  }),
  votes: many(votesTable),
}));

export const votesTable = sqliteTable("votes", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  user_id: text("user_id")
    .references(() => usersTable.id)
    .notNull(),
  race_id: int("race_id")
    .references(() => racesTable.id)
    .notNull(),
  created_at: int({ mode: "timestamp_ms" })
    .$default(() => new Date())
    .notNull(),
  updated_at: int({ mode: "timestamp_ms" }).$onUpdate(() => new Date()),
});

export const votesRelations = relations(votesTable, ({ one, many }) => ({
  races: one(racesTable, {
    fields: [votesTable.race_id],
    references: [racesTable.id],
  }),
  votePreferences: many(votePreferencesTable),
}));

export const votePreferencesTable = sqliteTable(
  "vote_preferences",
  {
    vote_id: int("vote_id")
      .references(() => votesTable.id)
      .notNull(),
    candidate_id: int("candidate_id")
      .references(() => candidatesTable.id, { onDelete: "cascade" })
      .notNull(),
    preference: int({ mode: "number" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.candidate_id, t.vote_id],
    }),
    check("preference_check", sql`${t.preference} >= 0`), // Votes start from 1 for first-preference
  ]
);

export const votePreferencesRelations = relations(
  votePreferencesTable,
  ({ one }) => ({
    votes: one(votesTable, {
      fields: [votePreferencesTable.vote_id],
      references: [votesTable.id],
    }),
    candidate: one(candidatesTable, {
      fields: [votePreferencesTable.vote_id],
      references: [candidatesTable.id],
    }),
  })
);

export const electedTable = sqliteTable(
  "elected",
  {
    candidate_id: int("candidate_id")
      .references(() => candidatesTable.id, { onDelete: "cascade" })
      .notNull(),
    race_id: int("race_id")
      .references(() => racesTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.candidate_id, table.race_id],
    }),
  ]
);

export const electedRelations = relations(electedTable, ({ one }) => ({
  candidates: one(candidatesTable, {
    fields: [electedTable.candidate_id],
    references: [candidatesTable.id],
  }),
  races: one(racesTable, {
    fields: [electedTable.race_id],
    references: [racesTable.id],
  }),
}));
