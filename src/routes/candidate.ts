import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { candidatesTable } from "@/models/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = factory.createApp();

app.get("/", async (c) => {
  const data = await c.var.STUB.getAllCandidates()

  return c.json(data)
});

app.get('/position/:id',
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    }),
  ), async (c) => {
  try {
    const { id } = c.req.valid('param')
    const data = await c.var.STUB.getAllCandidatesByPosition(id)

    return c.json(data)
  } catch (error) {
    throw new HTTPException(404, { message: "Candidates not found" });
  }
})

const insertSchema = createInsertSchema(candidatesTable)
.extend({
  positions: z.array(z.number())
}).omit({ isMember: true, id: true })

app.post('/',
  every(authenticate, requireAdmin),
  zValidator(
  "json",
  insertSchema,
),
async (c) => {
  const validated = c.req.valid("json");
  try {
    const [{ id }] = await c.var.STUB.insertCandidate({
      ...validated,
      isMember: true, // TODO Update with candidate status
    });
    await Promise.all(validated.positions.map((positionId) => {
      return c.var.STUB.insertNomination({ candidate_id: id, position_id: positionId })
    }))
    return c.json({ message: "Created successfully" });
  } catch(err) {
    throw new HTTPException(400, { message: "Failed to create candidate" })
  }
})


export default app;
