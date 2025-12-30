import { defineRelations, defineRelationsPart } from "drizzle-orm";
import {
  seatsTable,
  usersTable,
  positionsTable,
  racesTable,
  candidatesTable,
  nominationsTable,
  votesTable,
  votePreferencesTable,
  electedTable,
} from "./schema";

const schema = {
  positions: positionsTable,
  users: usersTable,
  seats: seatsTable,
  candidates: candidatesTable,
  nominations: nominationsTable,
  races: racesTable,
  votes: votesTable,
  votePreferences: votePreferencesTable,
  elected: electedTable,
};

export const seatRelations = defineRelationsPart(schema, (r) => ({
  seats: {
    user: r.one.users({
      from: r.seats.id,
      to: r.users.seat_id,
    }),
  },
}));

export const userRelations = defineRelationsPart(schema, (r) => ({
  users: {
    seat: r.one.seats({
      from: r.users.seat_id,
      to: r.seats.id,
    }),
  },
}));

export const positionRelations = defineRelationsPart(schema, (r) => ({
  positions: {
    nominations: r.many.nominations({
      from: r.positions.id,
      to: r.nominations.position_id,
    }),
    races: r.many.races({
      from: r.positions.id,
      to: r.races.position_id,
    }),
  },
}));

export const racesRelations = defineRelationsPart(schema, (r) => ({
  races: {
    position: r.one.positions({
      from: r.races.position_id,
      to: r.positions.id,
    }),
    votes: r.many.votes({
      from: r.races.id,
      to: r.votes.race_id,
    }),
  },
}));

export const candidateRelations = defineRelationsPart(schema, (r) => ({
  candidates: {
    nominations: r.many.nominations({
      from: r.candidates.id,
      to: r.nominations.candidate_id,
    }),
    votePreferences: r.many.votePreferences({
      from: r.candidates.id,
      to: r.votePreferences.candidate_id,
    }),
  },
}));

export const nominationRelations = defineRelationsPart(schema, (r) => ({
  nominations: {
    candidate: r.one.candidates({
      from: r.nominations.candidate_id,
      to: r.candidates.id,
    }),
    position: r.one.positions({
      from: r.nominations.position_id,
      to: r.positions.id,
    }),
  },
}));

export const voteRelations = defineRelationsPart(schema, (r) => ({
  votes: {
    race: r.one.races({
      from: r.votes.race_id,
      to: r.races.id,
    }),
    votePreferences: r.many.votePreferences({
      from: r.votes.id,
      to: r.votePreferences.vote_id,
    }),
  },
  votePreferences: {
    vote: r.one.votes({
      from: r.votePreferences.vote_id,
      to: r.votes.id,
    }),
    candidate: r.one.candidates({
      from: r.votePreferences.candidate_id,
      to: r.candidates.id,
    }),
  },
}));

export const electedRelations = defineRelationsPart(schema, (r) => ({
  elected: {
    candidate: r.one.candidates({
      from: r.elected.candidate_id,
      to: r.candidates.id,
    }),
    race: r.one.races({
      from: r.elected.race_id,
      to: r.races.id,
    }),
  },
}));

export const relations = {
  ...defineRelations(schema),  // Main relations MUST be first for proper type inference
  ...seatRelations,
  ...userRelations,
  ...positionRelations,
  ...racesRelations,
  ...candidateRelations,
  ...nominationRelations,
  ...voteRelations,
  ...electedRelations,
}