import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getAllRaces,
  getCurrentRace,
  getRace,
  updateRace,
} from "@/race/queries";

// Validation schemas
const raceIdSchema = z.object({
  id: z.number({ coerce: true }),
});

const updateRaceSchema = z.object({
  status: z.enum(["closed", "open", "finished"]),
  current: z.boolean(),
});

export const getAllRacesHandlers = factory.createHandlers(async (c) => {
  try {
    const races = await getAllRaces();
    return c.json(races);
  } catch (err) {
    throw new HTTPException(500, {
      message: "Unable to get races",
    });
  }
});

export const getCurrentRaceHandlers = factory.createHandlers(async (c) => {
  const data = await getCurrentRace();
  return c.json(data);
});

export const getRaceHandlers = factory.createHandlers(
  zValidator("param", raceIdSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const race = await getRace(id);
      return c.json(race);
    } catch (err) {
      throw new HTTPException(500, {
        message: "Unable to get race",
      });
    }
  }
);

export const updateRaceHandlers = factory.createHandlers(
  zValidator("json", updateRaceSchema),
  zValidator("param", raceIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { status, current } = c.req.valid("json");
    try {
      const data = await updateRace(id, { status, current });

      return c.json(data);
    } catch (err) {
      console.error(err);
      throw new HTTPException(500, {
        message: "Error updating race",
      });
    }
  }
);
