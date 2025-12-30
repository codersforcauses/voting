import { factory } from "@/shared/app";
import { HTTPException } from "hono/http-exception";
import { randomInt } from "crypto";
import { getSeat, getSeatByCode, insertSeat } from "@/seat/queries";

export const getSeatHandlers = factory.createHandlers(async (c) => {
  try {
    const id = c.req.param("id");
    const [seat] = await getSeat(Number(id));
    return c.json(seat);
  } catch (error) {
    throw new HTTPException(404, { message: "Seat not found" });
  }
});

export const getSeatByCodeHandlers = factory.createHandlers(async (c) => {
  try {
    const code = c.req.param("code");
    const [seat] = await getSeatByCode(code);
    return c.json(seat);
  } catch (error) {
    throw new HTTPException(404, { message: "Seat not found" });
  }
});

export const createSeatHandlers = factory.createHandlers(async (c) => {
  const code = randomInt(0, 1000000).toString().padStart(6, "0");
  await insertSeat({ code });
  return c.json(code);
});
