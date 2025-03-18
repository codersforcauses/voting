import { zValidator } from "@hono/zod-validator";
import { factory } from "@/app";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { every } from "hono/combine";
import { authenticate, requireAdmin } from "@/middleware/auth";

const app = factory.createApp();

app.get("/", every(authenticate, requireAdmin), async (c) => {
  try {
    const races = await c.var.STUB.getAllRaces();
    return c.json(races);
  } catch (err) {
    throw new HTTPException(500, {
      message: "Unable to get races",
    });
  }
});

app.patch(
  "/:id",
  authenticate,
  requireAdmin,
  zValidator(
    "json",
    z.object({
      status: z.enum(["closed", "open", "finished"]),
      current: z.boolean(),
    })
  ),
  async (c) => {
    const id = c.req.param("id");
    const { status, current } = await c.req.valid("json");
    try {
      const data = await c.var.STUB.updateRace(Number(id), { status, current });

      return c.json(data);
    } catch (err) {
      throw new HTTPException(500, {
        message: "Error updating",
      });
    }
  }
);

// app.post(
//   "/",
//   zValidator(
//     "json",
//     z.object({
//       title: z.string(),
//       description: z.string(),
//       priority: z.number(),
//       openings: z.number(),
//     })
//   ),
//   async (c) => {
//     const validated = c.req.valid("json");
//     try {
//       await c.var.STUB.insertPosition(validated);
//     } catch (err) {
//       console.log("weeee");
//     }
//     return c.json({ message: "Created successfully" });
//   }
// );

export default app;
