import { factory } from "@/app";
import { randomInt } from "crypto";
import { HTTPException } from "hono/http-exception";

const app = factory.createApp();

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [seat] = await c.var.STUB.getSeat(Number(id));
    return c.json(seat);
  } catch (error) {
    throw new HTTPException(404, { message: "Seat not found" });
  }
});

app.get("/code/:code", async (c) => {
  try {
    const code = c.req.param("code");
    const [seat] = await c.var.STUB.getSeatByCode(code);
    return c.json(seat);
  } catch (error) {
    throw new HTTPException(404, { message: "Seat not found" });
  }
});

app.post("/", async (c) => {
  const code = randomInt(0, 1000000).toString().padStart(6, "0");
  await c.var.STUB.insertSeat({ code });
  return c.json(code);
});

export default app;
