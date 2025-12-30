import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  deleteElectedForRace,
  getElectedForRace,
  getAllElected,
} from "@/elected/queries";
import { saveElectedForRace } from "@/race/queries";

// Validation schemas
const raceIdSchema = z.object({
  id: z.number({ coerce: true }),
});

export const recalculateRaceHandlers = factory.createHandlers(
  zValidator("param", raceIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    await deleteElectedForRace(id);
    try {
      const results = await saveElectedForRace(id);
      return c.json(results);
    } catch (err) {
      throw new HTTPException(500, {
        message: `Could not recalculate race ${err}`,
      });
    }
  }
);

export const getResultsByRaceHandlers = factory.createHandlers(
  zValidator("param", raceIdSchema),
  async (c) => {
    const role = c.get("ROLE");
    const { id } = c.req.valid("param");
    const previouslyElected = await getElectedForRace(id);

    if (role === "admin") {
      return c.json(previouslyElected);
    } else {
      const data = previouslyElected.map((result) => {
        return {
          elected: result.elected,
          candidates: {
            id: result.candidates?.id,
            name: result.candidates?.name,
          },
        };
      });
      return c.json(data);
    }
  }
);

export const getAllResultsHandlers = factory.createHandlers(async (c) => {
  const data = await getAllElected();
  if (data.length === 0)
    throw new HTTPException(404, { message: "No results found" });
  return c.json(data);
});
