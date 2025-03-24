import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { seedMasterSeat, devSeeds, seedPositions, seedRaces } from "./seed";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

import * as dbMod from "./db";

export interface DOEnv {
  ENVIRONMENT: "dev" | "prod";
  VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
  INIT_SEAT: string;
}

export class VotingObject extends DurableObject {
  storage: DurableObjectStorage;
  db: DrizzleSqliteDODatabase<typeof schema>;
  connections: Map<string, WebSocket>;

  constructor(ctx: DurableObjectState, env: DOEnv) {
    super(ctx, env);
    this.storage = this.ctx.storage;
    this.db = drizzle(this.storage, { logger: true, schema });

    this.connections = new Map();
    for (const ws of this.ctx.getWebSockets()) {
      const { connectionId } = ws.deserializeAttachment();
      console.log("hydrated connection", connectionId);
      this.connections.set(connectionId, ws);
    }

    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();

      const masterSeat = await this.db
        .select()
        .from(schema.seatsTable)
        .where(eq(schema.seatsTable.code, env.INIT_SEAT));
      if (masterSeat.length === 0) {
        await seedMasterSeat(env, this.db);
      }

      // Seed Positions, Races
      const numPositions = await this.db.$count(schema.positionsTable);
      if (numPositions === 0) {
        const positionIds = await seedPositions(this.db);
        await seedRaces(this.db, positionIds);
      }

      if (env.ENVIRONMENT !== "prod") {
        devSeeds(this.db);
      }
    });
  }

  fetch(request?: Request): Response | Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    const connectionId = crypto.randomUUID();

    this.ctx.acceptWebSocket(server);
    this.connections.set(connectionId, server);
    server.serializeAttachment({ connectionId });

    console.log(
      "New websocket connection",
      this.connections.size,
      "connections open"
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async _migrate() {
    migrate(this.db, migrations);
  }

  webSocketError(ws: WebSocket, error: unknown) {
    console.error("webSocketError", error);
    this.connections.delete(ws.deserializeAttachment().connectionId);
    console.log(this.connections.size, "connections open");
  }

  webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean
  ) {
    this.connections.delete(ws.deserializeAttachment().connectionId);
    console.log("webSocketClose,", this.connections.size, "connections open");
  }

  broadcast(message: string) {
    for (const connection of this.connections) {
      connection[1].send(message);
    }
  }
}

// Statically assign dbMod functions
for (const mod of Object.values(dbMod)) {
  Object.assign(VotingObject.prototype, mod);
}
