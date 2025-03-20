import { factory } from "@/app";
import { WackyVotingObject } from "..";
import { env } from "hono/adapter";

/**
 * addStub sets up the comedic DO stub so that routes can talk to our WackyVotingObject.
 */
export const addStub = factory.createMiddleware(async (c, next) => {
    const { VOTING_OBJECT } = env<{ VOTING_OBJECT: DurableObjectNamespace<WackyVotingObject>}>(c);
    const id = VOTING_OBJECT.idFromName("main");
    const stub = VOTING_OBJECT.get(id) as DurableObjectStub<WackyVotingObject>;
    c.set('STUB', stub)
    await next()
})
