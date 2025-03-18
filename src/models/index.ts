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
} from "./db/vote-preference";
import {
  getAllVotesForRace,
  insertVote,
  updateVote,
  getVoteByUser,
  deleteVote,
  getVoteAggregateForRace,
} from "./db/vote";
import {
  seedCandidate,
  seedVote,
  seedUsers,
  seedPositions,
  seedRaces,
  seedMasterSeat,
  seedSeats,
} from "./seed";
import {
  candidatesTable,
  racesTable,
  votesTable,
  positionsTable,
  seatsTable,
  usersTable,
} from "./schema";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

export interface DOEnv {
  ENVIRONMENT: "dev" | "production";
  VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
  DEFAULT_SEAT: string;
}

export class VotingObject extends DurableObject {
  storage: DurableObjectStorage;
  db: DrizzleSqliteDODatabase<typeof schema>;

  constructor(ctx: DurableObjectState, env: DOEnv) {
    super(ctx, env);
    this.storage = this.ctx.storage;
    this.db = drizzle(this.storage, { logger: true, schema });

    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();

      const masterSeat = await this.db
        .select()
        .from(seatsTable)
        .where(eq(seatsTable.code, env.DEFAULT_SEAT));
      if (masterSeat.length === 0) {
        await seedMasterSeat(env, this.db);
      }

      if (env.ENVIRONMENT === "dev") {
        // Seed Positions, Races and Candidates
        const numPositions = await this.db.$count(positionsTable);
        if (numPositions === 0) {
          const positionIds = await seedPositions(this.db);
          await seedRaces(this.db, positionIds);
          await seedCandidate(this.db, positionIds);
        }

        // Seed Users
        const numUsers = await this.db.$count(usersTable);
        if (numUsers === 0) {
          const seatIds = await seedSeats(this.db, 10)
          await seedUsers(this.db, 10, seatIds);
        }

        // Seed Votes
        const numVotes = await this.db.$count(votesTable);
        if (numVotes === 0) {
          const races = await this.db.select().from(racesTable);
          const raceIds = races.map((race) => ({
            race_id: race.id,
          }));
          const candidates = await this.db.select().from(candidatesTable);
          const candidateIds = candidates.map((candidate) => ({
            candidate_id: candidate.id,
          }));
          const users = await this.db.select().from(usersTable);
          const user_ids = users.map((user) => ({
            id: user.id,
          }));
          if (users.length > 0) {
            await seedVote(this.db, candidateIds, raceIds, user_ids);
          }
        }
      }
    });
  }

  async _migrate() {
    migrate(this.db, migrations);
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

  getVoteByUser(...args: Parameters<typeof getVoteByUser>) {
    return getVoteByUser.call(this, ...args);
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
}
