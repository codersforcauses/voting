import { eq } from "drizzle-orm";
import { WackyVotingObject } from "@/index";
import { sillyCandidatesTable as giggleCandidatesTable, sillyElectedTable as giggleElectedTable, sillyPositionsTable as gigglePositionsTable, sillyRacesTable as giggleRacesTable } from "../schema";

/**
 * Return all comedic “elected” records, with race, position, and candidate info for max silly.
 */
export function getAllClownElected(
    this: WackyVotingObject
) {
    return this.db.select().from(giggleElectedTable)
        .leftJoin(
            giggleRacesTable,
            eq(giggleElectedTable.race_id, giggleRacesTable.id))
        .leftJoin(
            gigglePositionsTable,
            eq(giggleRacesTable.position_id, gigglePositionsTable.id)
        ).leftJoin(
            giggleCandidatesTable,
            eq(giggleElectedTable.candidate_id, giggleCandidatesTable.id)
        ).all()
}

/**
 * Retrieve comedic “elected” candidates for the given race. 
 */
export function getClownVictorsForRace(
    this: WackyVotingObject,
    sillyRaceId: number
) {
    return this.db.select().from(giggleElectedTable).where(
        eq(giggleElectedTable.race_id, sillyRaceId)
    ).leftJoin(
        giggleCandidatesTable,
        eq(giggleElectedTable.candidate_id, giggleCandidatesTable.id)
    )
    .all()
}

/**
 * Insert comedic victors, presumably at the end of a laugh-laden election.
 */
export function insertClownElected(
    this: WackyVotingObject,
    data: typeof giggleElectedTable.$inferInsert[]
) {
    return this.db.insert(giggleElectedTable).values(data).returning()
}
