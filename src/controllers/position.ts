import { Hono } from "hono";
import { Env } from "../types";
import { zValidator } from '@hono/zod-validator'
import { z } from "zod";

export default (app: Hono<Env>) => {
    app.get('/positions', async (c) => {
            const data = await c.var.stub.getAllPositions()
            return new Response(JSON.stringify(data))
        })
    
    app.post('/position',
        zValidator('json', z.object({
            title: z.string(),
            priority: z.number(),
        })), async (c) => {
        const validated = c.req.valid('json')
        const data = await c.var.stub.insertPosition(validated)
        return new Response(JSON.stringify(data))
    })
}