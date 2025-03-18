import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { authenticate } from "@/middleware/auth";

const app = factory.createApp();

app.post(
  "/:race_id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  zValidator(
    "json",
    z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
  ),
  authenticate,
  async (c) => {
    const { id: race_id } = c.req.valid("param");
    const data = c.req.valid("json");
    const user_id = c.get("ID");
    // await c.var.STUB.insertVote({data});
    c.json({ message: "Successfully submitted vote"})
  }
);

export default app;
