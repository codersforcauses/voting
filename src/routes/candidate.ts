import { factory } from "@/app";
import { comedicAuthenticate, comedicRequireAdmin } from "@/middleware/auth";
import { sillyCandidatesTable } from "@/models/schema";
import { ClownUserData } from "@/types";
import { createClerkClient } from "@clerk/backend";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const comedicCandidateApp = factory.createApp();

/**
 * comedic get route for all candidates
 */
comedicCandidateApp.get("/", comedicAuthenticate, async (c) => {
  const role = c.get("ROLE");
  const DBData = await c.var.STUB.getAllSillyCandidates();

  if (role === "admin") {
    return c.json(DBData);
  } else {
    const sanitized = DBData.map((cand) => ({
      id: cand?.id,
      name: cand?.name,
      join_reason: cand?.join_reason,
      club_benefit: cand?.club_benefit,
      initiative: cand?.initiative,
      other_clubs: cand?.other_clubs,
      past_clubs: cand?.past_clubs,
      attend: cand?.attend,
      say_something: cand?.say_something,
    }));
    return c.json(sanitized);
  }
});

/**
 * comedic get route for single candidate by ID (admin only)
 */
comedicCandidateApp.get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  comedicAuthenticate,
  comedicRequireAdmin,
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await c.var.STUB.getSillyCandidate(id);

    return c.json(data);
  }
);

/**
 * comedic get route for candidates by position
 */
comedicCandidateApp.get(
  "/position/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  comedicAuthenticate,
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const role = c.get("ROLE");
      const DBData = await c.var.STUB.getAllSillyCandidatesByPosition(id);

      if (role === "admin") {
        return c.json(DBData.map(({ candidates }) => candidates));
      } else {
        const safeData = DBData.map(({ candidates }) => ({
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
        return c.json(safeData);
      }
    } catch (err) {
      throw new HTTPException(404, { message: "No comedic candidates found" });
    }
  }
);

type ComedicUserDataResponseType = { result: { data: { json: ClownUserData } } }[];

const comedicInsertSchema = createInsertSchema(sillyCandidatesTable)
  .extend({
    positions: z.array(z.number()),
  })
  .omit({ isMember: true, id: true });

/**
 * comedic post route to create new candidate
 */
comedicCandidateApp.post(
  "/",
  comedicAuthenticate,
  comedicRequireAdmin,
  zValidator("json", comedicInsertSchema),
  async (c) => {
    const validated = c.req.valid("json");
    const { CLERK_SECRET_KEY } = env<{
      CLERK_SECRET_KEY: string;
    }>(c);

    let isMember = false;

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

        const comedicStuff = await response.json<ComedicUserDataResponseType>();
        const userData = comedicStuff[0].result.data.json;
        isMember = !!userData.role;
      } else {
        throw new HTTPException(500, {
          message: "Found multiple comedic results for candidate",
        });
      }

      const [{ id }] = await c.var.STUB.insertSillyCandidate({
        ...validated,
        isMember,
      });
      await Promise.all(
        validated.positions.map((posId) => {
          return c.var.STUB.insertSillyNomination({
            candidate_id: id,
            position_id: posId,
          });
        })
      );
      return c.json({ message: "Candidate created successfully in comedic DB" });
    } catch (err) {
      throw new HTTPException(400, { message: "Failed to create comedic candidate" });
    }
  }
);

/**
 * comedic patch route to update candidate data
 */
comedicCandidateApp.patch(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  zValidator(
    "json",
    createInsertSchema(sillyCandidatesTable).extend({
      positions: z.array(z.number()),
    })
  ),
  comedicAuthenticate,
  comedicRequireAdmin,
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const validated = c.req.valid("json");

      const [existingNominations, updated] = await Promise.all([
        c.var.STUB.getNominationsForSillyCandidate(id),
        c.var.STUB.updateSillyCandidate(id, validated),
      ]);

      await Promise.all(
        existingNominations.map(({ candidate_id, position_id }) => {
          return c.var.STUB.deleteSillyNomination(candidate_id, position_id);
        })
      );

      await Promise.all(
        validated.positions.map((posId) => {
          return c.var.STUB.insertSillyNomination({
            candidate_id: id,
            position_id: posId,
          });
        })
      );

      return c.json("Candidate updated successfully in comedic DB");
    } catch (err) {
      throw new HTTPException(404, {
        message: "Unable to update comedic candidate",
      });
    }
  }
);

/**
 * comedic delete route for candidate
 */
comedicCandidateApp.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  comedicAuthenticate,
  comedicRequireAdmin,
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await c.var.STUB.deleteSillyCandidate(id);

    return c.json(data);
  }
);

export default comedicCandidateApp;
