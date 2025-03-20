import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { HTTPException } from "hono/http-exception";

const app = factory.createApp();

app.get(
  "/count/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const [votes, users] = await Promise.all([
      c.var.STUB.countVotesForRace(id),
      c.var.STUB.countUsers(),
    ]);
    return c.json({ votes, users });
  }
);

app.post(
  "/:race_id",
  zValidator(
    "param",
    z.object({
      race_id: z.number({ coerce: true }),
    })
  ),
  zValidator(
    "json",
    z.array(
      z.object({
        id: z.number({ coerce: true }),
        name: z.string(),
      })
    )
  ),
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
    vote = await c.var.STUB.getVoteByUserAndRace(user_id, race_id);

    if (!vote) {
      vote = await c.var.STUB.insertVote({
        race_id,
        user_id,
      });
    }

    const preferences = data.map((preference, index) =>
      c.var.STUB.insertVotePreference({
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

export default app;
