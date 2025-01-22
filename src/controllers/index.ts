import { Hono } from "hono"
import { Env } from "../types"

export function initControllers(app: Hono<Env>) {
  app.get('/', async (c) => {
    const data = await c.var.stub.getData()
    return c.text('yay')
  })
}
