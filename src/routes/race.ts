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
