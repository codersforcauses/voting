import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json("admin"));

export default app;
