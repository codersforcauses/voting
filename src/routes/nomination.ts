import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const comedicNominationApp = factory.createApp();

/**
 * comedic route to fetch nominations for a specific position
 */
comedicNominationApp.get(
  "/position/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param")
    const data = await c.var.STUB.getNominationsForSillyPosition(id);
    return c.json(data);
  }
);

export default comedicNominationApp;
