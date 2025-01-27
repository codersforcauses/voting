import { DurableObject } from "cloudflare:workers"
import { Env } from "../types"

import { candidateTableQuery, candidateSeedQuery } from "./candidate"
import { nominationTableQuery, nominationSeedQuery } from "./nomination"
import { positionTableQuery, positionSeedQuery, getAllPositions, createPosition } from "./position"
import { preferenceTableQuery, preferenceSeedQuery } from "./preference"
import { raceTableQuery, raceSeedQuery } from "./race"
import { voteTableQuery, voteSeedQuery } from "./vote"

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
    console.log('init settings');
    initDBSettings(this.sql)
    console.log('init models');
    initModels(this.sql)
    console.log('init seeds');
    seedModels(this.sql)
  }

  // Positions 
  getAllPositions() {
    return getAllPositions.call(this)
  }

  createPosition() {
    return createPosition.call(this)
  }
}
