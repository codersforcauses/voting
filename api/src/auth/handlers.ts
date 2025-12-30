import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { createClerkClient } from "@clerk/backend";
import { env } from "hono/adapter";
import { UserData } from "@/shared/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getSeatByCode } from "@/seat/queries";
import { getUserByEmail, insertUser } from "@/user/queries";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const loginHandlers = factory.createHandlers(
  zValidator("json", loginSchema),
  async (c) => {
  const { email, code } = c.req.valid("json");

  const [seat] = await getSeatByCode(code);

  if (!seat) {
    throw new HTTPException(404, { message: "Code not found" });
  }

  let id: number;
  let role: "user" | "admin" = code === process.env.INIT_SEAT ? "admin" : "user";

  const [user] = await getUserByEmail(email);

  if (user && user?.seat_id !== seat.id) {
    throw new HTTPException(400, { message: "Code does not match email" });
  }

  if (!user) {
    try {
      const [user] = await insertUser({
        email,
        role,
        seat_id: seat.id,
      });

      id = user.id;
      role = user.role;
    } catch (error) {
      throw new HTTPException(400, { message: "Code has already been used" });
    }
  } else {
    id = user.id;
    role = user.role!;
  }

  const token = await sign(
    {
      sub: id,
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
    },
    process.env.AUTH_SECRET_KEY!
  );

  return c.json(token);
  }
);

export const checkAdminHandlers = factory.createHandlers(async (c) => {
  return c.json(true);
});
