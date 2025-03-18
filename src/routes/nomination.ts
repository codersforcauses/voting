import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = factory.createApp();

app.get(
  "/position/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param")
    const data = await c.var.STUB.getNominationsForPosition(id);
    return c.json(data);
  }
);

export default app;
