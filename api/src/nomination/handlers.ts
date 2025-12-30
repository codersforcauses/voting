import { factory } from "@/shared/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getNominationsForPosition } from "@/nomination/queries";

// Validation schemas
const positionIdSchema = z.object({
  id: z.number({ coerce: true }),
});

export const getNominationsForPositionHandlers = factory.createHandlers(
  zValidator("param", positionIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await getNominationsForPosition(id);
    return c.json(data);
  }
);
