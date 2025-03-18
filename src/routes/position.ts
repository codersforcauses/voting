import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createInsertSchema } from 'drizzle-zod';
import { positionsTable } from "@/models/schema";

const app = factory.createApp();

app.get("/", async (c) => {
  const data = await c.var.STUB.getAllPositions();
  return c.json(data);
});

const insertedSchema = createInsertSchema(positionsTable)

app.post(
  "/",
  zValidator(
    "json",
    insertedSchema
  ),
  async (c) => {
    const validated = c.req.valid("json");
    await c.var.STUB.insertPosition(validated);
    return c.json({ message: "Created successfully" });
  }
);

export default app;
