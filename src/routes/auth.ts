import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { UserData } from "@/types";
import { createClerkClient } from "@clerk/backend";
import { zValidator } from "@hono/zod-validator";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { z } from "zod";

const app = factory.createApp();

app.post(
  "/",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      code: z.string().length(6),
    })
  ),
  async (c) => {
    const { email, code } = c.req.valid("json");

    const [seat] = await c.var.STUB.getSeatByCode(code);

    if (!seat) {
      throw new HTTPException(404, { message: "Code not found" });
    }

    const { CLERK_SECRET_KEY, AUTH_SECRET_KEY, INIT_SEAT } = env<{
      CLERK_SECRET_KEY: string;
      AUTH_SECRET_KEY: string;
      INIT_SEAT: string;
    }>(c);

    let id: string;
    let role: "user" | "admin" = code === INIT_SEAT ? "admin" : "user";

    const [user] = await c.var.STUB.getUserByEmail(email);

    if (user && user?.seat_id !== seat.id) {
      throw new HTTPException(400, { message: "Code does not match email" });
    }

    if (!user) {
      const clerkClient = createClerkClient({
        secretKey: CLERK_SECRET_KEY,
      });

      const { data } = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (data.length === 0) {
        throw new HTTPException(404, { message: "User not found" });
      }

      const response = await fetch(
        `https://codersforcauses.org/api/trpc/user.get?batch=1&input={"0":{"json":"${data[0].id}"}}`
      );

      type UserDataResponseType = { result: { data: { json: UserData } } }[];

      const {
        result: {
          data: { json: userData },
        },
      } = (await response.json<UserDataResponseType>())[0];

      if (!userData.role) {
        throw new HTTPException(404, { message: "User is not a CFC member" });
      }

      id = userData.id;

      try {
        await c.var.STUB.insertUser({
          id: userData.id, // uses id from clerk, db
          email: userData.email,
          role,
          name: userData.name,
          preferred_name: userData.preferred_name,
          student_num: userData.student_number,
          seat_id: seat.id,
        });
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
      AUTH_SECRET_KEY
    );

    return c.json(token);
  }
);

app.get("/", requireAdmin, async (c) => {
  return c.json(true);
});

export default app;
