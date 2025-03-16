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
  getAllCandidatesByRace,
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
  getAllVotes,
  insertVote,
  updateVote,
  getVote,
  deleteVote,
} from "./db/vote";
import { seedPositions } from "./seed";

export interface Env {
  ENVIRONMENT: "dev" | "production";
  VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
}

export class VotingObject extends DurableObject {
  storage: DurableObjectStorage;
  db: DrizzleSqliteDODatabase<any>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = this.ctx.storage;
    this.db = drizzle(this.storage, { logger: true });

    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();

      if (env.ENVIRONMENT === "dev") {
        // await seedPositions(this.db)
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

  getAllCandidatesByRace(...args: Parameters<typeof getAllCandidatesByRace>) {
    return getAllCandidatesByRace.call(this, ...args);
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
  getAllVotes(...args: Parameters<typeof getAllVotes>) {
    return getAllVotes.call(this, ...args);
  }

  getVote(...args: Parameters<typeof getVote>) {
    return getVote.call(this, ...args);
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
}
