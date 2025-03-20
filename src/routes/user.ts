import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";

const app = factory.createApp();

app.get("/", authenticate, requireAdmin, async (c) => {
  const data = await c.var.STUB.getAllUsers();

  const users = data.map(({ users: { seat_id, ...users }, seats }) => ({
    ...users,
    code: seats?.code,
  }));

  return c.json(users);
});

export default app;
