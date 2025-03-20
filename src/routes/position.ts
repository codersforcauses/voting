import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { positionsTable } from "@/models/schema";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { HTTPException } from "hono/http-exception";

const app = factory.createApp();

app.get("/", async (c) => {
  const data = await c.var.STUB.getAllPositions();
  return c.json(data);
});

const insertedSchema = createInsertSchema(positionsTable);

app.post(
  "/",
  authenticate,
  requireAdmin,
  zValidator("json", insertedSchema),
  async (c) => {
    const validated = c.req.valid("json");
    await c.var.STUB.insertPosition(validated);
    return c.json({ message: "Created successfully" });
  }
);

app.patch(
  "/",
  zValidator(
    "json",
    z.array(
      z.object({
        id: z.number({ coerce: true }),
        title: z.string(),
        description: z.string(),
        priority: z.number({ coerce: true }),
        openings: z.number({ coerce: true }),
      })
    )
  ),
  authenticate,
  requireAdmin,
  async (c) => {
    const validated = c.req.valid("json");
    const positions = await c.var.STUB.getAllPositions();

    const positionsToAdd = validated.filter((p) => p.id < 0);
    let positionsToUpdate: typeof validated = [];
    let positionsToDelete: number[] = [];

    positions.forEach((p) => {
      const found = validated.find((v) => v.id === p.id);
      if (!found) {
        positionsToDelete.push(p.id);
      } else {
        positionsToUpdate.push(found);
      }
    });

    try {
      await Promise.all([
        positionsToUpdate.map(({ id, ...pos }) =>
          c.var.STUB.updatePosition(id, pos)
        ),
        positionsToDelete.map((id) => c.var.STUB.deletePosition(id)),
        positionsToAdd.map(({ id, ...pos }) => c.var.STUB.insertPosition(pos)),
      ]);

      return c.json({ message: "Updated successfully" });
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to update positions" });
    }
  }
);

export default app;
