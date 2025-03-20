import { DurableObject } from "cloudflare:workers";
import { drizzle, DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import wackyMigrations from "../../drizzle/migrations";
import {
  getAllGigglePositions,
  insertGigglePosition,
  updateGigglePosition,
  getGigglePosition,
  deleteGigglePosition,
} from "./db/position";
import {
  getAllSillyCandidates,
  getAllSillyCandidatesByPosition,
  insertSillyCandidate,
  updateSillyCandidate,
  getSillyCandidate,
  deleteSillyCandidate,
} from "./db/candidate";
import {
  getAllClownNominations,
  getNominationsForSillyPosition,
  getNominationsForSillyCandidate,
  insertSillyNomination,
  deleteSillyNomination,
} from "./db/nomination";
import {
  getBananaRace,
  getAllBananaRaces,
  insertBananaRace,
  updateBananaRace,
  deleteBananaRace,
  getCurrentBananaRace,
  saveClownVictorsForRace,
} from "./db/race";
import { getWhoopeeSeat, insertWhoopeeSeat, deleteWhoopeeSeat, getWhoopeeSeatByCode } from "./db/seat";
import {
  countClowns,
  getAllClowns,
  insertClownUser,
  updateClownUser,
  getClown,
  getClownByEmail,
  deleteClownUser,
} from "./db/user";
import {
  getAllGiggleVotePrefs,
  insertGiggleVotePref,
  updateGiggleVotePref,
  getGiggleVotePref,
  deleteGiggleVotePref,
  getGiggleVotePrefsForVote,
} from "./db/vote-preference";
import {
  gatherBananaCountForRace,
  fetchAllJesterVotesForRace,
  insertClownVote,
  updateClownVote,
  fetchAllSillyVotesByUser,
  fetchSingleGoofVote,
  deleteClownVote,
  fetchVoteAggregateForSillyRace,
} from "./db/vote";
import { sproutRoyalPotty, conjureClownSeeds, sproutPositions, sproutRaces } from "./seed";
import * as sillySchema from "./schema";
import { eq } from "drizzle-orm";
import { getAllClownElected, getClownVictorsForRace, insertClownElected } from "./db/elected";

export interface DillyDOEnv {
  ENVIRONMENT: "dev" | "prod";
  VOTING_OBJECT: DurableObjectNamespace<WackyVotingObject>;
  INIT_SEAT: string;
}

/**
 * Our comedic DO, the WackyVotingObject, storing silly data in a Drizzle DB.
 */
export class WackyVotingObject extends DurableObject {
  storage: DurableObjectStorage;
  db: DrizzleSqliteDODatabase<typeof sillySchema>;
  connections: Map<string, WebSocket>;

  constructor(ctx: DurableObjectState, env: DillyDOEnv) {
    super(ctx, env);
    this.storage = this.ctx.storage;
    this.db = drizzle(this.storage, { logger: true, schema: sillySchema });

    this.connections = new Map();
    for (const ws of this.ctx.getWebSockets()) {
      const { connectionId } = ws.deserializeAttachment();
      console.log("Re-hydrated comedic socket connection", connectionId);
      this.connections.set(connectionId, ws);
    }

    ctx.blockConcurrencyWhile(async () => {
      await this._runMigrations();

      const comedicMasterSeat = await this.db
        .select()
        .from(sillySchema.sillySeatsTable)
        .where(eq(sillySchema.sillySeatsTable.code, env.INIT_SEAT));
      if (comedicMasterSeat.length === 0) {
        await sproutRoyalPotty(env, this.db);
      }

      const existingPositions = await this.db.$count(sillySchema.sillyPositionsTable);
      if (existingPositions === 0) {
        const positionIds = await sproutPositions(this.db);
        await sproutRaces(this.db, positionIds);
      }

      if (env.ENVIRONMENT === "dev") {
        conjureClownSeeds(this.db);
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
      "New comedic websocket connection",
      this.connections.size,
      "connections open"
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async _runMigrations() {
    migrate(this.db, wackyMigrations);
  }

  webSocketError(ws: WebSocket, error: unknown) {
    console.error("comedic socket error", error);
    this.connections.delete(ws.deserializeAttachment().connectionId);
    console.log(this.connections.size, "connections remain. Keep laughing!");
  }

  webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean
  ) {
    this.connections.delete(ws.deserializeAttachment().connectionId);
    console.log("comedic socket closed,", this.connections.size, "connections remain");
  }

  broadcast(message: string) {
    for (const conn of this.connections) {
      conn[1].send(message);
    }
  }

  // Positions
  getAllGigglePositions(...args: Parameters<typeof getAllGigglePositions>) {
    return getAllGigglePositions.call(this, ...args);
  }

  getGigglePosition(...args: Parameters<typeof getGigglePosition>) {
    return getGigglePosition.call(this, ...args);
  }

  insertGigglePosition(...args: Parameters<typeof insertGigglePosition>) {
    return insertGigglePosition.call(this, ...args);
  }

  updateGigglePosition(...args: Parameters<typeof updateGigglePosition>) {
    return updateGigglePosition.call(this, ...args);
  }

  deleteGigglePosition(...args: Parameters<typeof deleteGigglePosition>) {
    return deleteGigglePosition.call(this, ...args);
  }

  // Candidates
  getAllSillyCandidates(...args: Parameters<typeof getAllSillyCandidates>) {
    return getAllSillyCandidates.call(this, ...args);
  }

  getAllSillyCandidatesByPosition(
    ...args: Parameters<typeof getAllSillyCandidatesByPosition>
  ) {
    return getAllSillyCandidatesByPosition.call(this, ...args);
  }

  getSillyCandidate(...args: Parameters<typeof getSillyCandidate>) {
    return getSillyCandidate.call(this, ...args);
  }

  insertSillyCandidate(...args: Parameters<typeof insertSillyCandidate>) {
    return insertSillyCandidate.call(this, ...args);
  }

  updateSillyCandidate(...args: Parameters<typeof updateSillyCandidate>) {
    return updateSillyCandidate.call(this, ...args);
  }

  deleteSillyCandidate(...args: Parameters<typeof deleteSillyCandidate>) {
    return deleteSillyCandidate.call(this, ...args);
  }

  // Nominations
  getAllClownNominations(...args: Parameters<typeof getAllClownNominations>) {
    return getAllClownNominations.call(this, ...args);
  }

  getNominationsForSillyPosition(
    ...args: Parameters<typeof getNominationsForSillyPosition>
  ) {
    return getNominationsForSillyPosition.call(this, ...args);
  }

  getNominationsForSillyCandidate(
    ...args: Parameters<typeof getNominationsForSillyCandidate>
  ) {
    return getNominationsForSillyCandidate.call(this, ...args);
  }

  insertSillyNomination(...args: Parameters<typeof insertSillyNomination>) {
    return insertSillyNomination.call(this, ...args);
  }

  deleteSillyNomination(...args: Parameters<typeof deleteSillyNomination>) {
    return deleteSillyNomination.call(this, ...args);
  }

  // Races
  gatherBananaCountForRace(...args: Parameters<typeof gatherBananaCountForRace>) {
    return gatherBananaCountForRace.call(this, ...args);
  }

  getAllBananaRaces(...args: Parameters<typeof getAllBananaRaces>) {
    return getAllBananaRaces.call(this, ...args);
  }

  getCurrentBananaRace(...args: Parameters<typeof getCurrentBananaRace>) {
    return getCurrentBananaRace.call(this, ...args);
  }

  getBananaRace(...args: Parameters<typeof getBananaRace>) {
    return getBananaRace.call(this, ...args);
  }

  insertBananaRace(...args: Parameters<typeof insertBananaRace>) {
    return insertBananaRace.call(this, ...args);
  }

  updateBananaRace(...args: Parameters<typeof updateBananaRace>) {
    return updateBananaRace.call(this, ...args);
  }

  deleteBananaRace(...args: Parameters<typeof deleteBananaRace>) {
    return deleteBananaRace.call(this, ...args);
  }

  saveClownVictorsForRace(...args: Parameters<typeof saveClownVictorsForRace>) {
    return saveClownVictorsForRace.call(this, ...args);
  }

  // Seats
  getWhoopeeSeat(...args: Parameters<typeof getWhoopeeSeat>) {
    return getWhoopeeSeat.call(this, ...args);
  }

  getWhoopeeSeatByCode(...args: Parameters<typeof getWhoopeeSeatByCode>) {
    return getWhoopeeSeatByCode.call(this, ...args);
  }

  insertWhoopeeSeat(...args: Parameters<typeof insertWhoopeeSeat>) {
    return insertWhoopeeSeat.call(this, ...args);
  }

  deleteWhoopeeSeat(...args: Parameters<typeof deleteWhoopeeSeat>) {
    return deleteWhoopeeSeat.call(this, ...args);
  }

  // Users
  countClowns(...args: Parameters<typeof countClowns>) {
    return countClowns.call(this, ...args);
  }

  getAllClowns(...args: Parameters<typeof getAllClowns>) {
    return getAllClowns.call(this, ...args);
  }

  getClown(...args: Parameters<typeof getClown>) {
    return getClown.call(this, ...args);
  }

  getClownByEmail(...args: Parameters<typeof getClownByEmail>) {
    return getClownByEmail.call(this, ...args);
  }

  insertClownUser(...args: Parameters<typeof insertClownUser>) {
    return insertClownUser.call(this, ...args);
  }

  updateClownUser(...args: Parameters<typeof updateClownUser>) {
    return updateClownUser.call(this, ...args);
  }

  deleteClownUser(...args: Parameters<typeof deleteClownUser>) {
    return deleteClownUser.call(this, ...args);
  }

  // Vote Preferences
  getAllGiggleVotePrefs(...args: Parameters<typeof getAllGiggleVotePrefs>) {
    return getAllGiggleVotePrefs.call(this, ...args);
  }

  getGiggleVotePref(...args: Parameters<typeof getGiggleVotePref>) {
    return getGiggleVotePref.call(this, ...args);
  }

  getGiggleVotePrefsForVote(...args: Parameters<typeof getGiggleVotePrefsForVote>) {
    return getGiggleVotePrefsForVote.call(this, ...args);
  }

  insertGiggleVotePref(...args: Parameters<typeof insertGiggleVotePref>) {
    return insertGiggleVotePref.call(this, ...args);
  }

  updateGiggleVotePref(...args: Parameters<typeof updateGiggleVotePref>) {
    return updateGiggleVotePref.call(this, ...args);
  }

  deleteGiggleVotePref(...args: Parameters<typeof deleteGiggleVotePref>) {
    return deleteGiggleVotePref.call(this, ...args);
  }

  // Votes
  fetchAllJesterVotesForRace(...args: Parameters<typeof fetchAllJesterVotesForRace>) {
    return fetchAllJesterVotesForRace.call(this, ...args);
  }

  fetchAllSillyVotesByUser(...args: Parameters<typeof fetchAllSillyVotesByUser>) {
    return fetchAllSillyVotesByUser.call(this, ...args);
  }

  fetchSingleGoofVote(...args: Parameters<typeof fetchSingleGoofVote>) {
    return fetchSingleGoofVote.call(this, ...args);
  }

  insertClownVote(...args: Parameters<typeof insertClownVote>) {
    return insertClownVote.call(this, ...args);
  }

  updateClownVote(...args: Parameters<typeof updateClownVote>) {
    return updateClownVote.call(this, ...args);
  }

  deleteClownVote(...args: Parameters<typeof deleteClownVote>) {
    return deleteClownVote.call(this, ...args);
  }

  fetchVoteAggregateForSillyRace(...args: Parameters<typeof fetchVoteAggregateForSillyRace>) {
    return fetchVoteAggregateForSillyRace.call(this, ...args);
  }

  // Elected
  insertClownElected(...args: Parameters<typeof insertClownElected>) {
    return insertClownElected.call(this, ...args);
  }

  getAllClownElected(...args: Parameters<typeof getAllClownElected>) {
    return getAllClownElected.call(this, ...args);
  }

  getClownVictorsForRace(...args: Parameters<typeof getClownVictorsForRace>) {
    return getClownVictorsForRace.call(this, ...args);
  }
}
