import { eq } from "drizzle-orm";
import { db } from "@/db";
import { electedTable, candidatesTable, racesTable, positionsTable } from "@/db/schema";

export { electedTable };

export function getAllElected() {
    return db.select().from(electedTable)
        .leftJoin(
            racesTable,
            eq(electedTable.race_id, racesTable.id))
        .leftJoin(
            positionsTable,
            eq(racesTable.position_id, positionsTable.id)
        ).leftJoin(
            candidatesTable,
            eq(electedTable.candidate_id, candidatesTable.id)
        ).all()
}

export function getElectedForRace(
    id: number
) {
    return db.select().from(electedTable).where(
        eq(electedTable.race_id, id)
    ).leftJoin(
        candidatesTable,
        eq(electedTable.candidate_id, candidatesTable.id)
    )
    .all()
}

export function insertElected(
    data: typeof electedTable.$inferInsert[]
) {
    return db.insert(electedTable).values(data).returning()
}

export function deleteElectedForRace(
    id: number
) {
    return db.delete(electedTable).where(eq(electedTable.race_id, id)).returning()
}
