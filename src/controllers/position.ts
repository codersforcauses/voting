import { Hono } from "hono";
import { Env } from "../types";
import { zValidator } from '@hono/zod-validator'
import { createSchema } from "../models/position";

export default (app: Hono<Env>) => {
    app.get('/positions', async (c) => {
            const data = await c.var.stub.getAllPositions()
            return new Response(JSON.stringify(data))
        })
    
    app.post('/position',
        zValidator('json', createSchema), async (c) => {
        const validated = c.req.valid('json')
        const data = await c.var.stub.createPosition(validated)
        return new Response(JSON.stringify(data))
    })
}