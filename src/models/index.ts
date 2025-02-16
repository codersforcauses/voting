import { DurableObject } from "cloudflare:workers"
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite"
import { Env } from "../types"
import { migrate } from "drizzle-orm/durable-sqlite/migrator"
import migrations from '../drizzle/migrations';

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
  storage: DurableObjectStorage
  db: DrizzleSqliteDODatabase<any>

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env) 
    this.storage = this.ctx.storage
    this.db = drizzle(this.storage)

    ctx.blockConcurrencyWhile(async () => {
			await this._migrate();
		});
  }

  async _migrate() {
		migrate(this.db, migrations);
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