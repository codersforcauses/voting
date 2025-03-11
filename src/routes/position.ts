import { factory } from '@/app';
import { zValidator } from '@hono/zod-validator'
import { z } from "zod";

const app = factory.createApp()

app.get('/', async (c) => {
    const data = await c.var.STUB.getAllPositions()
    return new Response(JSON.stringify(data))
})

app.post('/',
    zValidator('json', z.object({
        title: z.string(),
        priority: z.number(),
    })), async (c) => {
    const validated = c.req.valid('json')
    const data = await c.var.STUB.insertPosition(validated)
    return new Response(JSON.stringify(data))
})

export default app