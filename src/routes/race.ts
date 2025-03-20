import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { every } from "hono/combine";
import { comedicAuthenticate, comedicRequireAdmin } from "@/middleware/auth";

const comedicRaceApp = factory.createApp();

/**
 * comedic route to fetch all races (admin only)
 */
comedicRaceApp.get("/", every(comedicAuthenticate, comedicRequireAdmin), async (c) => {
  try {
    const allRaces = await c.var.STUB.getAllBananaRaces();
    return c.json(allRaces);
  } catch (err) {
    throw new HTTPException(500, {
      message: "Unable to get comedic races",
    });
  }
});

/**
 * comedic route to get the currently open race
 */
comedicRaceApp.get("/current", async (c) => {
  const data = await c.var.STUB.getCurrentBananaRace()
  return c.json(data)
})

/**
 * comedic route to update a race (admin only)
 */
comedicRaceApp.patch(
  "/:id",
  comedicAuthenticate,
  comedicRequireAdmin,
  zValidator(
    "json",
    z.object({
      status: z.enum(["closed", "open", "finished"]),
      current: z.boolean(),
    })
  ),
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { status, current } = c.req.valid("json");
    try {
      const updated = await c.var.STUB.updateBananaRace(id, { status, current });
      return c.json(updated);
    } catch (err) {
      console.error(err)
      throw new HTTPException(500, {
        message: "Error updating comedic race",
      });
    }
  }
);

export default comedicRaceApp;
