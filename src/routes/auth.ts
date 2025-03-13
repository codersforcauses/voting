import { factory } from "@/app";
import { createClerkClient } from "@clerk/backend";
import { env } from "hono/adapter";
import { sign } from "hono/jwt";

const app = factory.createApp();

app.post("/", async (c) => {
  // TODO: verify seat
  const { CLERK_SECRET_KEY, AUTH_SECRET_KEY } = env<{
    CLERK_SECRET_KEY: string;
    AUTH_SECRET_KEY: string;
  }>(c);
  const clerkClient = createClerkClient({
    secretKey: CLERK_SECRET_KEY,
  });
  const { email } = await c.req.json();

  const { data } = await clerkClient.users.getUserList({
    emailAddress: [email],
  });

  if (data.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const response = await fetch(
    `https://codersforcauses.org/api/trpc/user.get?batch=1&input={"0":{"json":"${data[0].id}"}}`
  );

  type UserData = {
    result: {
      data: {
        json: {
          id: number;
          email: string;
          name: string;
          preferred_name: string;
          student_number: string;
          subscribe: boolean;
          role: string;
        };
      };
    };
  }[];

  const {
    result: {
      data: { json: userData },
    },
  } = (await response.json<UserData>())[0];

  if (!userData.role) {
    return c.json({ error: "User is not a current CFC member" }, 401);
  }

  const role = ["committee", "admin"].includes(userData.role)
    ? "admin"
    : "user";

  const token = await sign(
    {
      sub: userData.email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    },
    AUTH_SECRET_KEY
  );

  // TODO: save user data into db as voter
  const user = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    preferred_name: userData.preferred_name,
    role,
    token,
  };

  return c.json(user);
});

export default app;
