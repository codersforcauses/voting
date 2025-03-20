import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { sillyPositionsTable } from "@/models/schema";
import { comedicAuthenticate, comedicRequireAdmin } from "@/middleware/auth";
import { HTTPException } from "hono/http-exception";

const comedicPositionApp = factory.createApp();

/**
 * comedic route to get all positions
 */
comedicPositionApp.get("/", async (c) => {
  const data = await c.var.STUB.getAllGigglePositions();
  return c.json(data);
});

const comedicPositionInsertSchema = createInsertSchema(sillyPositionsTable);

/**
 * comedic route to create a new position (admin only)
 */
comedicPositionApp.post(
  "/",
  comedicAuthenticate,
  comedicRequireAdmin,
  zValidator("json", comedicPositionInsertSchema),
  async (c) => {
    const validated = c.req.valid("json");
    await c.var.STUB.insertGigglePosition(validated);
    return c.json({ message: "Comedic position created" });
  }
);

/**
 * comedic route to patch multiple positions
 */
comedicPositionApp.patch(
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
  comedicAuthenticate,
  comedicRequireAdmin,
  async (c) => {
    const validated = c.req.valid("json");
    const currentPositions = await c.var.STUB.getAllGigglePositions();

    const positionsToAdd = validated.filter((p) => p.id < 0);
    let positionsToUpdate: typeof validated = [];
    let positionsToDelete: number[] = [];

    currentPositions.forEach((pos) => {
      const found = validated.find((v) => v.id === pos.id);
      if (!found) {
        positionsToDelete.push(pos.id);
      } else {
        positionsToUpdate.push(found);
      }
    });

    try {
      // update existing comedic positions
      await Promise.all(
        positionsToUpdate.map(({ id, ...posData }) =>
          c.var.STUB.updateGigglePosition(id, posData)
        )
      );
      // delete comedic positions
      await Promise.all(
        positionsToDelete.map((id) => c.var.STUB.deleteGigglePosition(id))
      );
      // insert new comedic positions
      await Promise.all(
        positionsToAdd.map(({ id, ...posData }) => c.var.STUB.insertGigglePosition(posData))
      );

      return c.json({ message: "Comedic positions updated" });
    } catch (err) {
      throw new HTTPException(500, { message: "Failed to update comedic positions" });
    }
  }
);

export default comedicPositionApp;
