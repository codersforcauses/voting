import { DurableObject } from "cloudflare:workers"
import { Env } from "../types"

import { candidateTableQuery, candidateSeedQuery } from "./candidate"
import { nominationTableQuery, nominationSeedQuery } from "./nomination"
import { positionTableQuery, positionSeedQuery, getAllPositions, createPosition, createSchema, updatePosition, getPosition, updateSchema, deletePosition } from "./position"
import { preferenceTableQuery, preferenceSeedQuery } from "./preference"
import { raceTableQuery, raceSeedQuery } from "./race"
import { voteTableQuery, voteSeedQuery } from "./vote"
import { z } from "zod"

function initDBSettings(sql: SqlStorage) {
  sql.exec(
    `PRAGMA foreign_keys = TRUE;`
  )
}

function initModels(sql: SqlStorage) {
  sql.exec(
    candidateTableQuery +
    positionTableQuery +
    raceTableQuery +
    nominationTableQuery +
    voteTableQuery +
    preferenceTableQuery
  )
}

function seedModels(sql: SqlStorage) {
  sql.exec(
    positionSeedQuery +
    raceSeedQuery +
    candidateSeedQuery +
    nominationSeedQuery +
    voteSeedQuery +
    preferenceSeedQuery
  )
}

export class VotingObject extends DurableObject {
  sql: SqlStorage

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env) 
    this.sql = this.ctx.storage.sql
    initDBSettings(this.sql)
    initModels(this.sql)
    seedModels(this.sql)
  }

  // Positions 
  getAllPositions() {
    return getAllPositions.call(this)
  }

  getPosition(id: string) {
    return getPosition.call(this, id)
  }

  createPosition(data: z.infer<typeof createSchema>) {
    return createPosition.call(this, data)
  }

  updatePosition(id: string, data: z.infer<typeof updateSchema>) {
    return updatePosition.call(this, id, data)
  }

  deletePosition(id: string) {
    return deletePosition.call(this, id)
  }
}