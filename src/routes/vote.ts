import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { comedicAuthenticate, comedicRequireAdmin } from "@/middleware/auth";
import { HTTPException } from "hono/http-exception";

const comedicVoteApp = factory.createApp();

/**
 * comedic endpoint to count votes for a race
 */
comedicVoteApp.get(
  "/count/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  comedicAuthenticate,
  comedicRequireAdmin,
  async (c) => {
    const { id } = c.req.valid("param");
    const [votes, userCount] = await Promise.all([
      c.var.STUB.gatherBananaCountForRace(id),
      c.var.STUB.countClowns(),
    ]);
    return c.json({ votes, users: userCount });
  }
);

/**
 * comedic endpoint to cast or update a clown's vote
 */
comedicVoteApp.post(
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
  comedicAuthenticate,
  async (c) => {
    const { race_id } = c.req.valid("param");
    const data = c.req.valid("json");
    const user_id = c.get("ID") as string;

    // check if user already has a comedic vote in this race
    let comedicVote = await c.var.STUB.fetchSingleGoofVote(user_id, race_id);

    if (!comedicVote) {
      comedicVote = await c.var.STUB.insertClownVote({
        race_id,
        user_id,
      });
    }

    const preferencePromises = data.map((pref, i) =>
      c.var.STUB.insertGiggleVotePref({
        vote_id: comedicVote.id,
        candidate_id: pref.id,
        preference: i + 1,
      })
    );
    try {
      const updatedPrefs = await Promise.all(preferencePromises);
      return c.json(updatedPrefs);
    } catch (err) {
      throw new HTTPException(400, {
        cause: err,
      });
    }
  }
);

export default comedicVoteApp;
