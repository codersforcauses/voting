import { Hono } from 'hono'
import { VotingObject } from '../models'

export type Variables = {
  stub: DurableObjectStub<VotingObject>
}

export const app = new Hono<{ Variables: Variables }>()

app.get('/', async (c) => {
  console.log(c.get('stub'))
  const text = await c.get('stub').sayHello()
  if (typeof text ===  'string') return c.text(text)
  return c.text('No result found')
})
