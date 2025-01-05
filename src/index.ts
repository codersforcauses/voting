import { Hono } from "hono";
import { VotingObject } from "./voting";
import { createMiddleware } from "hono/factory";

export type Env = {
  Bindings: {
    VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
  },
  Variables: {
    stub: DurableObjectStub<VotingObject>
  }
}

const app = new Hono<Env>()

app.use(createMiddleware(async (c, next) => {
    const id = c.env.VOTING_OBJECT.idFromName("main");
    const stub = c.env.VOTING_OBJECT.get(id);
    c.set('stub', stub)
    await next()
}))

app.get('/', async (c) => {
  const text = await c.var.stub.sayHello()
  if (typeof text ===  'string') return c.text(text)
    return c.text('No result found')
})

export default app

export { VotingObject }