import { factory } from "@/app";
import { authenticate, requireAdmin } from "@/middleware/auth";
import { every } from "hono/combine";

const app = factory.createApp();

app.get("/", every(authenticate, requireAdmin), async (c) => {
    const data = await c.var.STUB.getAllUsers();
  
    const users = data.map(({ users: { seat_id, ...users }, seats }) => ({
      ...users,
      code: seats?.code,
    }));
  
    return c.json(users);
});

export default app