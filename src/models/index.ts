import { DurableObject } from "cloudflare:workers"
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite"
import { migrate } from "drizzle-orm/durable-sqlite/migrator"
import migrations from '../../drizzle/migrations';
import { getAllPositions, insertPosition, updatePosition, getPosition, deletePosition } from "./position"
import { seed } from "drizzle-seed";
import { positionsTable } from "./schema";
import { seedPositions } from "./position/schema";

export class VotingObject extends DurableObject {
  storage: DurableObjectStorage
  db: DrizzleSqliteDODatabase<any>

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env) 
    this.storage = this.ctx.storage
    this.db = drizzle(this.storage)
    
    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();
      
      if (env.ENVIRONMENT === 'dev') {
        await seedPositions(this.db)
      }
		});
  }

  async _migrate() {
		migrate(this.db, migrations);
	}

  // Positions 
  getAllPositions() {
    return getAllPositions.call(this)
  }

  getPosition(id: number) {
    return getPosition.call(this, id)
  }

  insertPosition(data: Parameters<typeof insertPosition>[0]) {
    return insertPosition.call(this, data)
  }

  updatePosition(
    id: number,
    data: Parameters<typeof updatePosition>[1]
  ) {
    return updatePosition.call(this, id, data)
  }

  deletePosition(id: number) {
    return deletePosition.call(this, id)
  }
}