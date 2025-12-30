import { eq } from "drizzle-orm";
import { positionsTable } from "@/db/schema";
import { db } from "@/db";

export { positionsTable };

export function getAllPositions() {
  return db.select().from(positionsTable); 
}

export function getPosition(id: number) {
  return db.select().from(positionsTable).where(eq(positionsTable.id, id));
}

export function insertPosition(
  data: Omit<typeof positionsTable.$inferInsert, "id">
) {
  return db.insert(positionsTable).values(data).returning();
}

export function updatePosition(
  id: number,
  data: Partial<Omit<typeof positionsTable.$inferInsert, "id">>
) {
  return db
    .update(positionsTable)
    .set(data)
    .where(eq(positionsTable.id, id))
    .returning();
}

export function deletePosition(id: number) {
  return db
    .delete(positionsTable)
    .where(eq(positionsTable.id, id))
    .returning();
}
