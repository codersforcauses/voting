import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { candidatesTable } from "@/models/schema";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { every } from "hono/combine";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = factory.createApp();

app.get("/", authenticate, async (c) => {
  const role = c.get("ROLE");
  const DBData = await c.var.STUB.getAllCandidates();

  if (role === "admin") {
    const data = DBData.map((candidates) => candidates);
    return c.json(data);
  } else {
    const data = DBData.map((candidates) => ({
      id: candidates?.id,
      name: candidates?.name,
      join_reason: candidates?.join_reason,
      club_benefit: candidates?.club_benefit,
      initiative: candidates?.initiative,
      other_clubs: candidates?.other_clubs,
      past_clubs: candidates?.past_clubs,
      attend: candidates?.attend,
      say_something: candidates?.say_something,
    }));
    return c.json(data);
  }
});

app.get(
  "/position/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  authenticate,
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const role = c.get("ROLE");
      const DBData = await c.var.STUB.getAllCandidatesByPosition(id);

      console.log(JSON.stringify(DBData, null, 2));

      if (role === "admin") {
        const data = DBData.map(({ candidates }) => candidates);
        console.log(JSON.stringify(data, null, 2));

        return c.json(data);
      } else {
        const data = DBData.map(({ candidates }) => ({
          id: candidates?.id,
          name: candidates?.name,
          join_reason: candidates?.join_reason,
          club_benefit: candidates?.club_benefit,
          initiative: candidates?.initiative,
          other_clubs: candidates?.other_clubs,
          past_clubs: candidates?.past_clubs,
          attend: candidates?.attend,
          say_something: candidates?.say_something,
        }));
        return c.json(data);
      }
    } catch (error) {
      throw new HTTPException(404, { message: "Candidates not found" });
    }
  }
);

const insertSchema = createInsertSchema(candidatesTable)
  .extend({
    positions: z.array(z.number()),
  })
  .omit({ isMember: true, id: true });

app.post(
  "/",
  every(authenticate, requireAdmin),
  zValidator("json", insertSchema),
  async (c) => {
    const validated = c.req.valid("json");
    try {
      const [{ id }] = await c.var.STUB.insertCandidate({
        ...validated,
        isMember: true, // TODO Update with candidate status
      });
      await Promise.all(
        validated.positions.map((positionId) => {
          return c.var.STUB.insertNomination({
            candidate_id: id,
            position_id: positionId,
          });
        })
      );
      return c.json({ message: "Created successfully" });
    } catch (err) {
      throw new HTTPException(400, { message: "Failed to create candidate" });
    }
  }
);

export default app;
