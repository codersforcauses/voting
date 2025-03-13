import { Hono } from "hono";
import { randomInt } from "node:crypto";
import nominationRouter from "./nominations";

const app = new Hono();

app.route("/nominations", nominationRouter);

app.get("/", (c) => c.json("admin"));

app.get("/seed", (c) => {
  const seat = randomInt(0, 999999).toString().padStart(6, "0");
  // TODO: save seat to database
  return c.json(seat);
});

export default app;
