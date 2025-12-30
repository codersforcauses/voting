import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { env } from "hono/adapter";
import { createClerkClient } from "@clerk/backend";
import { UserData } from "@/shared/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import {
  getAllCandidates,
  getCandidate,
  getAllCandidatesByPosition,
  insertCandidate,
  updateCandidate,
  deleteCandidate,
} from "@/candidate/queries";
import {
  getNominationsForCandidate,
  insertNomination,
  deleteNomination,
} from "@/nomination/queries";
import { candidatesTable } from "@/db/schema";

// Validation schemas
const candidateIdSchema = z.object({
  id: z.number({ coerce: true }),
});

const insertCandidateSchema = createInsertSchema(candidatesTable)
  .extend({
    positions: z.array(z.number()),
  })
  .omit({ isMember: true, id: true });

const updateCandidateSchema = createInsertSchema(candidatesTable).extend({
  positions: z.array(z.number()),
});

type UserDataResponseType = { result: { data: { json: UserData } } }[];

export const getAllCandidatesHandlers = factory.createHandlers(async (c) => {
  const role = c.get("ROLE");
  const DBData = await getAllCandidates();

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

export const getCandidateHandlers = factory.createHandlers(
  zValidator("param", candidateIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await getCandidate(id);

    return c.json(data);
  }
);

export const getCandidatesByPositionHandlers = factory.createHandlers(
  zValidator("param", candidateIdSchema),
  async (c) => {
  try {
    const { id } = c.req.valid("param");
    const role = c.get("ROLE");
    const DBData = await getAllCandidatesByPosition(id);

    if (role === "admin") {
      const data = DBData.map(({ candidates }) => candidates);

      return c.json(data);
    } else {
      const data = DBData.map(({ candidates, nominations }) => ({
        id: candidates?.id,
        name: candidates?.name,
        join_reason: candidates?.join_reason,
        club_benefit: candidates?.club_benefit,
        initiative: candidates?.initiative,
        other_clubs: candidates?.other_clubs,
        past_clubs: candidates?.past_clubs,
        attend: candidates?.attend,
        say_something: candidates?.say_something,
        nominations,
      }));
      return c.json(data);
    }
  } catch (error) {
    throw new HTTPException(404, { message: "Candidates not found" });
  }
  }
);

export const createCandidateHandlers = factory.createHandlers(
  zValidator("json", insertCandidateSchema),
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
      isMember = !!userData?.role;
    } else {
      throw new HTTPException(500, {
        message: "Found too many results matching the candidate",
      });
    }

    const [{ id }] = await insertCandidate({
      isMember,
      ...validated,
    });
    await Promise.all(
      validated.positions.map((positionId) => {
        return insertNomination({
          candidate_id: id,
          position_id: positionId,
        });
      })
    );
    return c.json({ message: "Created successfully" });
  } catch (err) {
    console.error(err);
    throw new HTTPException(400, { message: "Failed to create candidate" });
  }
  }
);

export const updateCandidateHandlers = factory.createHandlers(
  zValidator("param", candidateIdSchema),
  zValidator("json", updateCandidateSchema),
  async (c) => {
  try {
    const { id } = c.req.valid("param");
    const validated = c.req.valid("json");

    const [nominations, updated] = await Promise.all([
      getNominationsForCandidate(id),
      updateCandidate(id, validated),
    ]);

    await Promise.all(
      nominations.map(({ candidate_id, position_id }) => {
        return deleteNomination(candidate_id, position_id);
      })
    );

    await Promise.all(
      validated.positions.map((positionId) => {
        return insertNomination({
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

export const deleteCandidateHandlers = factory.createHandlers(
  zValidator("param", candidateIdSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = await deleteCandidate(id);

    return c.json(data);
  }
);
