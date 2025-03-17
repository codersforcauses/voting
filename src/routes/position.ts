import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = factory.createApp();

app.get("/", async (c) => {
  const data = await c.var.STUB.getAllPositions();
  return c.json(data);
});

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
