import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const app = factory.createApp();

app.post("/recalc/race/:id", 
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const results = await c.var.STUB.saveElectedForRace(id)
    return c.json(results)
  }
)

app.get("/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
async (c) => {
  const role = c.get("ROLE");
  const { id } = c.req.valid("param");
  const previouslyElected = await c.var.STUB.getElectedForRace(id)
  if (previouslyElected.length === 0) throw new HTTPException(404, { message: "No results found for race" });
  
  if (role === "admin") {
    return c.json(previouslyElected);
  } else {
    const data = previouslyElected.map((elected) => ({
      id: elected.candidates?.id,
      name: elected.candidates?.name
    }));
    return c.json(data);
  }
});

app.get("/", async (c) => {
  const data = await c.var.STUB.getAllElected()
  if (data.length === 0) throw new HTTPException(404, { message: "No results found" });
  return c.json(data)
})

export default app;
