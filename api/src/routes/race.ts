import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { every } from "hono/combine";
import { authenticate, requireAdmin } from "@/middleware/auth";

const app = factory.createApp();

app.get("/", every(authenticate, requireAdmin), async (c) => {
  try {
    const races = await c.var.STUB.getAllRaces();
    return c.json(races);
  } catch (err) {
    throw new HTTPException(500, {
      message: "Unable to get races",
    });
  }
});

app.get("/current", async (c) => {
  const data = await c.var.STUB.getCurrentRace()
  return c.json(data)
})

app.get("/:id", zValidator(
  "param",
  z.object({
    id: z.number({ coerce: true }),
  })
), async (c) => {
  try {
    const { id } = c.req.valid("param");
    const race = await c.var.STUB.getRace(id);
    return c.json(race);
  } catch (err) {
    throw new HTTPException(500, {
      message: "Unable to get race",
    });
  }
});

app.patch(
  "/:id",
  requireAdmin,
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
      const data = await c.var.STUB.updateRace(id, { status, current });

      return c.json(data);
    } catch (err) {
      console.error(err)
      throw new HTTPException(500, {
        message: "Error updating race",
      });
    }
  }
);

export default app;
