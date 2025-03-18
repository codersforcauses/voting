import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { authenticate, requireAdmin } from "@/middleware/auth";

const app = factory.createApp();

app.post(
  "/",
  zValidator(
    "json",
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.number(),
      openings: z.number(),
    })
  ),
  authenticate,
  async (c) => {
    const validated = c.req.valid("json");
    try {
      await c.var.STUB.insertPosition(validated);
    } catch (err) {
      console.log("weeee");
    }
    return c.json({ message: "Created successfully" });
  }
);

export default app;
