import { factory } from "@/app";
import { createClerkClient } from "@clerk/backend";
import { env } from "hono/adapter";

const app = factory.createApp()

app.post("/", async (c) => {
  const { CLERK_SECRET_KEY } = env<{ CLERK_SECRET_KEY: string}>(c);
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
    result: { data: { json: {
      id: number;
      email: string;
      name: string;
      preferred_name: string;
      role: string;
    }}};
  }[];

  const { result: { data: { json: user }}} = (await response.json<UserData>())[0];
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    preferred_name: user.preferred_name,
    canVote: !!user.role,
    isAdmin: ["committee", "admin"].includes(user.role),
  });
});

export default app