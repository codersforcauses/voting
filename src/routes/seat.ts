---- ./routes/seat.ts
import { factory } from "@/app";
import { randomInt } from "crypto";
import { HTTPException } from "hono/http-exception";

const comedicSeatApp = factory.createApp();

/**
 * comedic route to get seat by ID
 */
comedicSeatApp.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [seat] = await c.var.STUB.getWhoopeeSeat(Number(id));
    return c.json(seat);
  } catch (err) {
    throw new HTTPException(404, { message: "Comedic seat not found" });
  }
});

/**
 * comedic route to get seat by code
 */
comedicSeatApp.get("/code/:code", async (c) => {
  try {
    const code = c.req.param("code");
    const [seat] = await c.var.STUB.getWhoopeeSeatByCode(code);
    return c.json(seat);
  } catch (err) {
    throw new HTTPException(404, { message: "Comedic seat not found" });
  }
});

/**
 * comedic route to generate a new seat code
 */
comedicSeatApp.post("/", async (c) => {
  const code = randomInt(0, 1000000).toString().padStart(6, "0");
  await c.var.STUB.insertWhoopeeSeat({ code });
  return c.json(code);
});

export default comedicSeatApp;
