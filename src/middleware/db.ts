import { factory } from "@/app";
import { VotingObject } from "..";
import { env } from "hono/adapter";

export const addStub = factory.createMiddleware(async (c, next) => {
    const { VOTING_OBJECT } = env<{ VOTING_OBJECT: DurableObjectNamespace<VotingObject>}>(c);
    const id = VOTING_OBJECT.idFromName("main");
    const stub = VOTING_OBJECT.get(id) as DurableObjectStub<VotingObject>;
    c.set('STUB', stub)
    await next()
})