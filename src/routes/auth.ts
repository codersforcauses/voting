import { Hono } from "hono";
import { createClerkClient } from "@clerk/backend";
import { env } from "hono/adapter";

const app = new Hono();

type ClerkEnv = {
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
};

app.post("/", async (c) => {
  const clerkEnv = env<ClerkEnv>(c);
  const clerkClient = createClerkClient({
    secretKey: clerkEnv.CLERK_SECRET_KEY,
  });
  const { email } = await c.req.json();

  const { data } = await clerkClient.users.getUserList({
    emailAddress: [email],
  });
  if (data.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  const fetchedData = await fetch(
    `https://codersforcauses.org/api/trpc/user.get?batch=1&input={"0":{"json":"${data[0].id}"}}`
  );
  const userData = await fetchedData.json();

  const user = userData[0].result.data.json;

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    preferred_name: user.preferred_name,
    canVote: !!user.role,
    isAdmin: ["committee", "admin"].includes(user.role),
  });
});

export default app;
