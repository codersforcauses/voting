import { factory } from "@/app";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const comedicResultsApp = factory.createApp();

/**
 * comedic route to recalc results for a race
 */
comedicResultsApp.post("/recalc/race/:id", 
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const newElected = await c.var.STUB.saveClownVictorsForRace(id)
    return c.json(newElected)
  }
)

/**
 * comedic route to get results for a specific race
 */
comedicResultsApp.get("/:id",
  zValidator(
    "param",
    z.object({
      id: z.number({ coerce: true }),
    })
  ),
async (c) => {
  const role = c.get("ROLE");
  const { id } = c.req.valid("param");
  const previouslyElected = await c.var.STUB.getClownVictorsForRace(id)
  if (previouslyElected.length === 0) throw new HTTPException(404, { message: "No comedic results found" });
  
  if (role === "admin") {
    return c.json(previouslyElected);
  } else {
    const data = previouslyElected.map((winner) => ({
      id: winner.candidates?.id,
      name: winner.candidates?.name
    }));
    return c.json(data);
  }
});

/**
 * comedic route to get all comedic results
 */
comedicResultsApp.get("/", async (c) => {
  const data = await c.var.STUB.getAllClownElected()
  if (data.length === 0) throw new HTTPException(404, { message: "No comedic results found" });
  return c.json(data)
})

export default comedicResultsApp;
