import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { randomInt } from "crypto";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = factory.createApp();

app.get("/:id",
  // every(authenticate, requireAdmin),
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
async (c) => {
  try {
    const { id } = c.req.valid("param");
    const data = await c.var.STUB.saveElectedForRace(id);
    return c.json(data);
  } catch (error) {
    throw new HTTPException(500, { message: "Could not get vote aggregate" });
  }
});

export default app;
