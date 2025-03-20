import { factory } from "@/app";
import { comedicAuthenticate, comedicRequireAdmin } from "@/middleware/auth";
import { ClownUserData } from "@/types";
import { createClerkClient } from "@clerk/backend";
import { zValidator } from "@hono/zod-validator";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { z } from "zod";

const comedicAuthApp = factory.createApp();

/**
 * comedic route that logs in user if seat code matches
 */
comedicAuthApp.post(
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

    const [seat] = await c.var.STUB.getWhoopeeSeatByCode(code);

    if (!seat) {
      throw new HTTPException(404, { message: "Comedic code not found" });
    }

    const { CLERK_SECRET_KEY, AUTH_SECRET_KEY, INIT_SEAT } = env<{
      CLERK_SECRET_KEY: string;
      AUTH_SECRET_KEY: string;
      INIT_SEAT: string;
    }>(c);

    let comedicId: string;
    let comedicRole: "user" | "admin" = code === INIT_SEAT ? "admin" : "user";

    const [existingUser] = await c.var.STUB.getClownByEmail(email);

    if (existingUser && existingUser?.seat_id !== seat.id) {
      throw new HTTPException(400, { message: "Comedic code mismatch with email" });
    }

    if (!existingUser) {
      const clerkClient = createClerkClient({
        secretKey: CLERK_SECRET_KEY,
      });

      const { data } = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (data.length === 0) {
        throw new HTTPException(404, { message: "User not found in comedic ledger" });
      }

      // Example external data call for user info
      const response = await fetch(
        `https://codersforcauses.org/api/trpc/user.get?batch=1&input={"0":{"json":"${data[0].id}"}}`
      );

      type ComedicUserDataResponse = { result: { data: { json: ClownUserData } } }[];
      const comedicData = (await response.json<ComedicUserDataResponse>())[0];
      const userData = comedicData.result.data.json;

      if (!userData.role) {
        throw new HTTPException(404, { message: "User is not in comedic org" });
      }

      comedicId = userData.id;

      try {
        await c.var.STUB.insertClownUser({
          id: userData.id,
          email: userData.email,
          role: comedicRole,
          name: userData.name,
          preferred_name: userData.preferred_name,
          student_num: userData.student_number,
          seat_id: seat.id,
        });
      } catch (error) {
        throw new HTTPException(400, { message: "Comedic code already used" });
      }
    } else {
      comedicId = existingUser.id;
      comedicRole = existingUser.role!;
    }

    const comedicToken = await sign(
      {
        sub: comedicId,
        role: comedicRole,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
      },
      AUTH_SECRET_KEY
    );

    return c.json(comedicToken);
  }
);

/**
 * comedic route that checks if admin
 */
comedicAuthApp.get("/", comedicAuthenticate, comedicRequireAdmin, async (c) => {
  return c.json({ success: true });
});

export default comedicAuthApp;
