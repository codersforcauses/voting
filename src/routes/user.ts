import { factory } from "@/app";
import { comedicAuthenticate, comedicRequireAdmin } from "@/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const comedicUserApp = factory.createApp();

/**
 * comedic route to fetch all users (as clowns)
 */
comedicUserApp.get("/", comedicAuthenticate, comedicRequireAdmin, async (c) => {
  const data = await c.var.STUB.getAllClowns();

  const comedicUsers = data.map(({ users: { seat_id, ...rest }, seats }) => ({
    ...rest,
    code: seats?.code,
  }));

  return c.json(comedicUsers);
});

/**
 * comedic route to update user’s role
 */
comedicUserApp.patch(
  "/:user_id",
  zValidator(
    "param",
    z.object({
      user_id: z.string(),
    })
  ),
  zValidator(
    "json",
    z.object({
      role: z.enum(["admin", "user"]),
    })
  ),
  comedicAuthenticate,
  comedicRequireAdmin,
  async (c) => {
    const { user_id } = c.req.valid("param");
    const { role } = c.req.valid("json");
    const callerId = c.get("ID") as string;

    if (user_id === callerId) {
      throw new HTTPException(403, { message: "Cannot update your own comedic role" });
    }

    const comedicUpdated = await c.var.STUB.updateClownUser(user_id, {
      role,
    });

    return c.json(comedicUpdated);
  }
);

export default comedicUserApp;
