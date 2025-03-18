import { eq } from "drizzle-orm";
import { VotingObject } from "@/index";
import { candidatesTable, electedTable, positionsTable, racesTable } from "../schema";

export function getAllElected(
    this: VotingObject
) {
    return this.db.select().from(electedTable)
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
    this: VotingObject,
    id: number
) {
    return this.db.select().from(electedTable).where(
        eq(electedTable.race_id, id)
    ).leftJoin(
        candidatesTable,
        eq(electedTable.candidate_id, candidatesTable.id)
    )
    .all()
}

export function insertElected(
    this: VotingObject,
    data: typeof electedTable.$inferInsert[]
) {
    return this.db.insert(electedTable).values(data).returning()
}