import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import {
  positionsTable,
  getAllPositions,
  insertPosition,
  updatePosition,
  deletePosition,
} from "@/position/queries";

// Validation schemas
const insertPositionSchema = createInsertSchema(positionsTable);

const updatePositionsSchema = z.array(
  z.object({
    id: z.number({ coerce: true }),
    title: z.string(),
    description: z.string(),
    priority: z.number({ coerce: true }),
    openings: z.number({ coerce: true }),
  })
);

type PositionUpdate = {
  id: number;
  title: string;
  description: string;
  priority: number;
  openings: number;
};

export const getAllPositionsHandlers = factory.createHandlers(async (c) => {
  const data = await getAllPositions();
  return c.json(data);
});

export const createPositionHandlers = factory.createHandlers(
  zValidator("json", insertPositionSchema),
  async (c) => {
    const validated = c.req.valid("json");
    await insertPosition(validated);
    return c.json({ message: "Created successfully" });
  }
);

export const updatePositionsHandlers = factory.createHandlers(
  zValidator("json", updatePositionsSchema),
  async (c) => {
  const validated = c.req.valid("json") as PositionUpdate[];
  const positions = await getAllPositions();

  const positionsToAdd = validated.filter((p) => p.id < 0);
  let positionsToUpdate: PositionUpdate[] = [];
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
    // is separate to avoid clashes with data for insert and update
    await Promise.all(
      positionsToUpdate.map(({ id, ...pos }) => updatePosition(id, pos))
    );
    await Promise.all(positionsToDelete.map((id) => deletePosition(id)));
    await Promise.all(
      positionsToAdd.map(({ id, ...pos }) => insertPosition(pos))
    );

    return c.json({ message: "Updated successfully" });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to update positions" });
  }
  }
);
