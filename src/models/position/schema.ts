import { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const positionsTable = sqliteTable("positions_table", {
  id: int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  priority: int({ mode: "number" }).notNull().unique(),
});

export const seedPositions = (db: DrizzleSqliteDODatabase) => {
  return db.insert(positionsTable).values([
    { title: "President", priority: 1 },
    { title: "Vice President", priority: 2 },
    { title: "Secretary", priority: 3 },
    { title: "Treasurer", priority: 4 },
    { title: "Technical Lead", priority: 5 },
    { title: "Marketing Officer", priority: 6 },
    { title: "Fresher Representative", priority: 7 },
    { title: "Ordinary Committee Member", priority: 8 },
  ]);
};
