import { Hono } from "hono";
import nominationRouter from "./nominations";

const app = new Hono();

app.route("/nominations", nominationRouter);

app.get("/", (c) => c.json("admin"));

export default app;
