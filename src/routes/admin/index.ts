import { authenticate, requireAdmin } from "@/middleware/auth";
import nominationRouter from "./nominations";
import seatRoutes from "./seat";
import { factory } from "@/app";
import { every } from "hono/combine";

const app = factory.createApp();

app.use(every(authenticate, requireAdmin))

app.route("/nominations", nominationRouter);
app.route("/seat", seatRoutes);

app.get("/", (c) => c.json("admin"));

app.get("/users", async (c) => {
  const data = await c.var.STUB.getAllUsers();

  const users = data.map(({ users: { seat_id, ...users }, seats }) => ({
    ...users,
    code: seats?.code,
  }));

  return c.json(users);
});

export default app;
