import { factory } from "@/app";
import { UserData } from "@/types";
import { createClerkClient } from "@clerk/backend";
import { zValidator } from "@hono/zod-validator";
import { env } from "hono/adapter";
import { sign } from "hono/jwt";
import { z } from "zod";

const app = factory.createApp();

app.post("/", zValidator('json', 
  z.object({
    email: z.string().email(),
    code: z.string().length(6),
  })), async (c) => {
    
  const { email, code } = await c.req.json();
  const [seat] = await c.var.STUB.getSeatByCode(code)

  if (!seat) {
    return c.json({ error: "Seat not found" }, 404);
  }

  const { CLERK_SECRET_KEY, AUTH_SECRET_KEY } = env<{
    CLERK_SECRET_KEY: string;
    AUTH_SECRET_KEY: string;
  }>(c);
  const clerkClient = createClerkClient({
    secretKey: CLERK_SECRET_KEY,
  });
  
  const { data } = await clerkClient.users.getUserList({
    emailAddress: [email],
  });

  if (data.length === 0) {
    return c.json({ error: "User not found" }, 404);
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
    return c.json({ error: "User is not a current CFC member" }, 401);
  }

  const role = ["committee", "admin"].includes(userData.role)
    ? "admin"
    : "user";

  await c.var.STUB.insertUser({
    email: userData.email,
    role,
    name: userData.name,
    preferred_name: userData.preferred_name,
    student_num: userData.student_number,
    seat_id: seat.id
  });

  const token = await sign(
    {
      sub: userData.email,
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
    },
    AUTH_SECRET_KEY
  );

  return c.json({ token });
});

export default app;
