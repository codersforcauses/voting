import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = factory.createApp();

app.get("/", authenticate, requireAdmin, async (c) => {
  const data = await c.var.STUB.getAllUsers();

  const users = data.map(({ users: { seat_id, ...users }, seats }) => ({
    ...users,
    code: seats?.code,
  }));

  return c.json(users);
});

app.patch(
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
  authenticate,
  requireAdmin,
  async (c) => {
    const { user_id } = c.req.valid("param");
    const { role } = c.req.valid("json");
    const id = c.get("ID") as string;

    if (user_id === id) {
      throw new HTTPException(403, { message: "Cannot update your own role" });
    }

    const updatedUser = await c.var.STUB.updateUser(user_id, {
      role,
    });

    return c.json(updatedUser);
  }
);

export default app;
