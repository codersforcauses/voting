import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  countVotesForRace,
  getVoteByUserAndRace,
  getVoteCollatedForRace,
  getVotePreferenceForCandidate,
  insertVote,
  insertVotePreference,
} from "@/vote/queries";
import { countUsers } from "@/user/queries";
import { getElectedForRace } from "@/elected/queries";

// Validation schemas
const raceIdSchema = z.object({
  id: z.number({ coerce: true }),
});

const raceIdParamSchema = z.object({
  race_id: z.number({ coerce: true }),
});

const voteDataSchema = z.array(
  z.object({
    id: z.number({ coerce: true }),
    name: z.string(),
  })
);

export const getVoteCountHandlers = factory.createHandlers(
  zValidator("param", raceIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const [votes, users] = await Promise.all([
      countVotesForRace(id),
      countUsers(),
    ]);
    return c.json({ votes, users });
  }
);

export const getWinningVotesHandlers = factory.createHandlers(
  zValidator("param", raceIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const winners = await getElectedForRace(id);
    const elected_preferences = (
      await Promise.all(
        winners.map((winner) => {
          return getVotePreferenceForCandidate(winner.elected.candidate_id);
        })
      )
    ).map((preferences) => {
      return preferences.reduce<{ [key: number]: number }>((acc, curr) => {
        if (!acc[curr.preference]) acc[curr.preference] = 0;
        acc[curr.preference] += 1;
        return acc;
      }, {});
    });
    return c.json(elected_preferences);
  }
);

export const getVotesByRaceHandlers = factory.createHandlers(
  zValidator("param", raceIdParamSchema),
  async (c) => {
    const { race_id } = c.req.valid("param");
    const votes = await getVoteCollatedForRace(race_id);
    return c.json(votes);
  }
);

export const createVoteHandlers = factory.createHandlers(
  zValidator("param", raceIdParamSchema),
  zValidator("json", voteDataSchema),
  async (c) => {
    const { race_id } = c.req.valid("param");
    const data = c.req.valid("json");
    const user_id = c.get("ID") as string;

    let vote:
      | {
          id: number;
          race_id: number;
          user_id: string;
        }
      | undefined;

    // check vote for user in race
    vote = await getVoteByUserAndRace(user_id, race_id);

    if (!vote) {
      vote = await insertVote({
        race_id,
        user_id,
      });
    }

    const preferences = data.map((preference, index) =>
      insertVotePreference({
        vote_id: vote.id,
        candidate_id: preference.id,
        preference: index + 1,
      })
    );
    try {
      const vote_preferences = await Promise.all(preferences);
      return c.json(vote_preferences);
    } catch (e) {
      throw new HTTPException(400, {
        cause: e,
      });
    }
  }
);
