import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import {
  getAllPositions,
  insertPosition,
  updatePosition,
  getPosition,
  deletePosition,
} from "./db/position";
import {
  getAllCandidates,
  getAllCandidatesByPosition,
  insertCandidate,
  updateCandidate,
  getCandidate,
  deleteCandidate,
} from "./db/candidate";
import {
  getAllNominations,
  getNominationsForPosition,
  getNominationsForCandidate,
  insertNomination,
  deleteNomination,
} from "./db/nomination";
import {
  getRace,
  getAllRaces,
  insertRace,
  updateRace,
  deleteRace,
  getCurrentRace,
  saveElectedForRace,
} from "./db/race";
import { getSeat, insertSeat, deleteSeat, getSeatByCode } from "./db/seat";
import {
  getAllUsers,
  insertUser,
  updateUser,
  getUser,
  getUserByEmail,
  deleteUser,
} from "./db/user";
import {
  getAllVotePreferences,
  insertVotePreference,
  updateVotePreference,
  getVotePreference,
  deleteVotePreference,
  getVotePreferencesForVote,
} from "./db/vote-preference";
import {
  getAllVotesForRace,
  insertVote,
  updateVote,
  getAllVotesByUser,
  getVoteByUserAndRace,
  deleteVote,
  getVoteAggregateForRace,
} from "./db/vote";
import {
  seedMasterSeat,
  devSeeds,
  seedPositions,
  seedRaces,
} from "./seed";
import {
  positionsTable,
  seatsTable,
} from "./schema";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { deleteElectedForRace, getAllElected, getElectedForRace, insertElected } from "./db/elected";

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
        .from(seatsTable)
        .where(eq(seatsTable.code, env.INIT_SEAT));
      if (masterSeat.length === 0) {
        await seedMasterSeat(env, this.db);
      }

      // Seed Positions, Races
      const numPositions = await this.db.$count(positionsTable);
      if (numPositions === 0) {
        const positionIds = await seedPositions(this.db);
        await seedRaces(this.db, positionIds);
      }

      if (env.ENVIRONMENT === "dev") {
        devSeeds(this.db)
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

  // Positions
  getAllPositions(...args: Parameters<typeof getAllPositions>) {
    return getAllPositions.call(this, ...args);
  }

  getPosition(...args: Parameters<typeof getPosition>) {
    return getPosition.call(this, ...args);
  }

  insertPosition(...args: Parameters<typeof insertPosition>) {
    return insertPosition.call(this, ...args);
  }

  updatePosition(...args: Parameters<typeof updatePosition>) {
    return updatePosition.call(this, ...args);
  }

  deletePosition(...args: Parameters<typeof deletePosition>) {
    return deletePosition.call(this, ...args);
  }

  // Candidates
  getAllCandidates(...args: Parameters<typeof getAllCandidates>) {
    return getAllCandidates.call(this, ...args);
  }

  getAllCandidatesByPosition(
    ...args: Parameters<typeof getAllCandidatesByPosition>
  ) {
    return getAllCandidatesByPosition.call(this, ...args);
  }

  getCandidate(...args: Parameters<typeof getCandidate>) {
    return getCandidate.call(this, ...args);
  }

  insertCandidate(...args: Parameters<typeof insertCandidate>) {
    return insertCandidate.call(this, ...args);
  }

  updateCandidate(...args: Parameters<typeof updateCandidate>) {
    return updateCandidate.call(this, ...args);
  }

  deleteCandidate(...args: Parameters<typeof deleteCandidate>) {
    return deleteCandidate.call(this, ...args);
  }

  // Nominations
  getAllNominations(...args: Parameters<typeof getAllNominations>) {
    return getAllNominations.call(this, ...args);
  }

  getNominationsForPosition(
    ...args: Parameters<typeof getNominationsForPosition>
  ) {
    return getNominationsForPosition.call(this, ...args);
  }

  getNominationsForCandidate(
    ...args: Parameters<typeof getNominationsForCandidate>
  ) {
    return getNominationsForCandidate.call(this, ...args);
  }

  insertNomination(...args: Parameters<typeof insertNomination>) {
    return insertNomination.call(this, ...args);
  }

  deleteNomination(...args: Parameters<typeof deleteNomination>) {
    return deleteNomination.call(this, ...args);
  }

  // Races
  getAllRaces(...args: Parameters<typeof getAllRaces>) {
    return getAllRaces.call(this, ...args);
  }

  getCurrentRace(...args: Parameters<typeof getCurrentRace>) {
    return getCurrentRace.call(this, ...args);
  }

  getRace(...args: Parameters<typeof getRace>) {
    return getRace.call(this, ...args);
  }

  insertRace(...args: Parameters<typeof insertRace>) {
    return insertRace.call(this, ...args);
  }

  updateRace(...args: Parameters<typeof updateRace>) {
    return updateRace.call(this, ...args);
  }

  deleteRace(...args: Parameters<typeof deleteRace>) {
    return deleteRace.call(this, ...args);
  }

  saveElectedForRace(...args: Parameters<typeof saveElectedForRace>) {
    return saveElectedForRace.call(this, ...args);
  }

  // Seats
  getSeat(...args: Parameters<typeof getSeat>) {
    return getSeat.call(this, ...args);
  }

  getSeatByCode(...args: Parameters<typeof getSeatByCode>) {
    return getSeatByCode.call(this, ...args);
  }

  insertSeat(...args: Parameters<typeof insertSeat>) {
    return insertSeat.call(this, ...args);
  }

  deleteSeat(...args: Parameters<typeof deleteSeat>) {
    return deleteSeat.call(this, ...args);
  }

  // Users
  getAllUsers(...args: Parameters<typeof getAllUsers>) {
    return getAllUsers.call(this, ...args);
  }

  getUser(...args: Parameters<typeof getUser>) {
    return getUser.call(this, ...args);
  }

  getUserByEmail(...args: Parameters<typeof getUser>) {
    return getUserByEmail.call(this, ...args);
  }

  insertUser(...args: Parameters<typeof insertUser>) {
    return insertUser.call(this, ...args);
  }

  updateUser(...args: Parameters<typeof updateUser>) {
    return updateUser.call(this, ...args);
  }

  deleteUser(...args: Parameters<typeof deleteUser>) {
    return deleteUser.call(this, ...args);
  }

  // Vote Preferences
  getAllVotePreferences(...args: Parameters<typeof getAllVotePreferences>) {
    return getAllVotePreferences.call(this, ...args);
  }

  getVotePreference(...args: Parameters<typeof getVotePreference>) {
    return getVotePreference.call(this, ...args);
  }

  getVotePreferencesForVote(
    ...args: Parameters<typeof getVotePreferencesForVote>
  ) {
    return getVotePreferencesForVote.call(this, ...args);
  }

  insertVotePreference(...args: Parameters<typeof insertVotePreference>) {
    return insertVotePreference.call(this, ...args);
  }

  updateVotePreference(...args: Parameters<typeof updateVotePreference>) {
    return updateVotePreference.call(this, ...args);
  }

  deleteVotePreference(...args: Parameters<typeof deleteVotePreference>) {
    return deleteVotePreference.call(this, ...args);
  }

  // Votes
  getAllVotesForRace(...args: Parameters<typeof getAllVotesForRace>) {
    return getAllVotesForRace.call(this, ...args);
  }

  getAllVotesByUser(...args: Parameters<typeof getAllVotesByUser>) {
    return getAllVotesByUser.call(this, ...args);
  }

  getVoteByUserAndRace(...args: Parameters<typeof getVoteByUserAndRace>) {
    return getVoteByUserAndRace.call(this, ...args);
  }

  insertVote(...args: Parameters<typeof insertVote>) {
    return insertVote.call(this, ...args);
  }

  updateVote(...args: Parameters<typeof updateVote>) {
    return updateVote.call(this, ...args);
  }

  deleteVote(...args: Parameters<typeof deleteVote>) {
    return deleteVote.call(this, ...args);
  }

  getVoteAggregateForRace(...args: Parameters<typeof getVoteAggregateForRace>) {
    return getVoteAggregateForRace.call(this, ...args);
  }

  // Elected
  insertElected(...args: Parameters<typeof insertElected>) {
    return insertElected.call(this, ...args);
  }

  getAllElected(...args: Parameters<typeof getAllElected>) {
    return getAllElected.call(this, ...args);
  }

  getElectedForRace(...args: Parameters<typeof getElectedForRace>) {
    return getElectedForRace.call(this, ...args);
  }

  deleteElectedForRace(...args: Parameters<typeof deleteElectedForRace>) {
    return deleteElectedForRace.call(this, ...args);
  }
}
