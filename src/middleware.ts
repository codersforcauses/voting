import { Env } from "./models";
import { createMiddleware } from "hono/factory";

export const stubContext = (env: Env) => 
  createMiddleware(async (c, next) => {
    console.log('running middleware');
    const id = env.VOTING_OBJECT.idFromName("main");
    const stub = env.VOTING_OBJECT.get(id);
    console.log(stub);
    c.set('stub', stub)
    await next()
})