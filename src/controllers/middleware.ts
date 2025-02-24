import { createMiddleware } from "hono/factory";
import { Hono } from "hono";
import { Env } from "../types";
import { VotingObject } from "..";

export function initMiddleware(app: Hono<Env>) {
  app.use(addStub)
}

const addStub = createMiddleware(async (c, next) => {
  const id = c.env.VOTING_OBJECT.idFromName("main");
  const stub = c.env.VOTING_OBJECT.get(id) as DurableObjectStub<VotingObject>;
  c.set('stub', stub)
  await next()
})