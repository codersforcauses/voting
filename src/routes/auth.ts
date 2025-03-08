import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const id = "";
  const fetchedData = await fetch(
    `https://codersforcauses.org/api/trpc/user.get?batch=1&input={"0":{"json":"${id}"}}`
  );
  const data = await fetchedData.json();

  return c.json(data[0].result.data.json);
});

export default app;
