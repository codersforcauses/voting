import { Hono } from "hono";
import { Env } from "../types";

export default (app: Hono<Env>) => {
    app.get('/positions', async (c) => {
        const data = await c.var.stub.getAllPositions()
        return new Response(JSON.stringify(data))
    })
}