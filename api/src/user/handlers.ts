import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAllUsers, updateUser } from "@/user/queries";

// Validation schemas
const userParamSchema = z.object({
  user_id: z.string(),
});

const updateUserSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export const getAllUsersHandlers = factory.createHandlers(async (c) => {
  const data = await getAllUsers();

  const users = data.map(({ users: { seat_id, ...users }, seats }) => ({
    ...users,
    code: seats?.code,
  }));

  return c.json(users);
});

export const updateUserHandlers = factory.createHandlers(
  zValidator("param", userParamSchema),
  zValidator("json", updateUserSchema),
  async (c) => {
    const { user_id } = c.req.valid("param");
    const { role } = c.req.valid("json");
    const id = c.get("ID") as string;

    if (user_id === id) {
      throw new HTTPException(403, { message: "Cannot update your own role" });
    }

    const updatedUser = await updateUser(user_id, {
      role,
    });

    return c.json(updatedUser);
  }
);
