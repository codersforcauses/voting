import { factory } from "@/app";
import { randomInt } from "crypto";

const app = factory.createApp();

app.get('/', async (c) => {
    const seats = await c.var.STUB.getAllSeats()
    return c.json(seats)
})

app.post('/', async (c) => {
    const code = randomInt(0, 999999).toString().padStart(6, "0");
    await c.var.STUB.insertSeat({ code })
    return c.json({ code })
})

export default app;