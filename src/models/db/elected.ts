import { VotingObject } from "@/index";
import { electedTable } from "../schema";

export function insertElected(
    this: VotingObject,
    data: typeof electedTable.$inferInsert
) {
    return this.db.insert(electedTable).values(data).returning()
}