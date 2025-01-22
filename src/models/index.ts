import { DurableObject } from "cloudflare:workers"
import { Env } from "../types"

import candidateTable from './candidate/table.sql'
import candidateSeed from './candidate/seed.sql'

import positionTable from './position/table.sql'
import positionSeed from './position/seed.sql'

import raceTable from './race/table.sql'
import raceSeed from './race/seed.sql'

import nominationTable from './nomination/table.sql'
import nominationSeed from './nomination/seed.sql'

import voteTable from './vote/table.sql'
import voteSeed from './vote/seed.sql'

import preferenceTable from './preference/table.sql'
import preferenceSeed from './preference/seed.sql'

function initDBSettings(sql: SqlStorage) {
  sql.exec(
    `PRAGMA foreign_keys = TRUE;`
  )
}

function initModels(sql: SqlStorage) {
  sql.exec(
    candidateTable +
    positionTable +
    raceTable +
    nominationTable +
    voteTable +
    preferenceTable
  )
}

function seedModels(sql: SqlStorage) {
  sql.exec(
    candidateSeed +
    positionSeed +
    raceSeed +
    candidateSeed +
    nominationSeed +
    voteSeed +
    preferenceSeed
  )
}

export class VotingObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env) 
    console.log('init settings');
    initDBSettings(this.ctx.storage.sql)
    console.log('init models');
    initModels(this.ctx.storage.sql)
    console.log('init seed');
    seedModels(this.ctx.storage.sql)
  }

  getData() {
    // const data = {
    //   position: this.ctx.storage.sql.exec(`SELECT * FROM position`).toArray(),
    //   race: this.ctx.storage.sql.exec(`SELECT * FROM race`).toArray(),
    //   candidate: this.ctx.storage.sql.exec(`SELECT * FROM candidate`).toArray(),
    //   nomination: this.ctx.storage.sql.exec(`SELECT * FROM nomination`).toArray(),
    //   vote: this.ctx.storage.sql.exec(`SELECT * FROM vote`).toArray(),
    //   preference: this.ctx.storage.sql.exec(`SELECT * FROM preference`).toArray()
    // }
// console.log(data);
//     return data
    console.log('yeehaw');
    return 'yeehaw'
  }
}