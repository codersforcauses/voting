import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { candidatesTable } from "@/models/schema";
import { UserData } from "@/types";
import { createClerkClient } from "@clerk/backend";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = factory.createApp();

app.get("/", async (c) => {
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
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  requireAdmin,
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await c.var.STUB.getCandidate(id);

    return c.json(data);
  }
);

app.get(
  "/position/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const role = c.get("ROLE");
      const DBData = await c.var.STUB.getAllCandidatesByPosition(id);

      if (role === "admin") {
        const data = DBData.map(({ candidates }) => candidates);

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

type UserDataResponseType = { result: { data: { json: UserData } } }[];

const insertSchema = createInsertSchema(candidatesTable)
  .extend({
    positions: z.array(z.number()),
  })
  .omit({ isMember: true, id: true });

app.post(
  "/",
  requireAdmin,
  zValidator("json", insertSchema),
  async (c) => {
    const validated = c.req.valid("json");
    const { CLERK_SECRET_KEY } = env<{
      CLERK_SECRET_KEY: string;
    }>(c);

    let isMember;

    try {
      const clerkClient = createClerkClient({
        secretKey: CLERK_SECRET_KEY,
      });

      const { data: clerkUsers } = await clerkClient.users.getUserList({
        emailAddress: [validated.email],
        query: validated.name,
      });
      if (clerkUsers.length === 0) {
        isMember = false;
      } else if (clerkUsers.length === 1) {
        const response = await fetch(
          `https://codersforcauses.org/api/trpc/user.get?batch=1&input={"0":{"json":"${clerkUsers[0].id}"}}`
        );

        const [
          {
            result: {
              data: { json: userData },
            },
          },
        ] = await response.json<UserDataResponseType>();
        isMember = !!userData.role;
      } else {
        throw new HTTPException(500, {
          message: "Found too many results matching the candidate",
        });
      }

      const [{ id }] = await c.var.STUB.insertCandidate({
        ...validated,
        isMember,
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

app.patch(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  zValidator(
    "json",
    createInsertSchema(candidatesTable).extend({
      positions: z.array(z.number()),
    })
  ),
  requireAdmin,
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const validated = c.req.valid("json");

      const [nominations, updated] = await Promise.all([
        c.var.STUB.getNominationsForCandidate(id),
        c.var.STUB.updateCandidate(id, validated),
      ]);

      await Promise.all(
        nominations.map(({ candidate_id, position_id }) => {
          return c.var.STUB.deleteNomination(candidate_id, position_id);
        })
      );

      await Promise.all(
        validated.positions.map((positionId) => {
          return c.var.STUB.insertNomination({
            candidate_id: id,
            position_id: positionId,
          });
        })
      );

      return c.json("Updated successfully");
    } catch (error) {
      throw new HTTPException(404, {
        message: "Unable to update candidate data",
      });
    }
  }
);

app.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  requireAdmin,
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await c.var.STUB.deleteCandidate(id);

    return c.json(data);
  }
);

export default app;
