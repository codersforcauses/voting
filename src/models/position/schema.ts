import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const positionsTable = sqliteTable("positions_table", {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    priority: int().notNull().unique(),
})