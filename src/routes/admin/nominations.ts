import { Hono } from "hono";

const app = new Hono();

// get all
app.get("/", (c) => {
  return c.json("nominations");
});
// create
app.post("/", (c) => {
  return c.json("nominations");
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id });
});

app.put("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id });
});

app.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id });
});

export default app;
