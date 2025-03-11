import { createFactory } from "hono/factory";
import { VotingObject } from "./models";

interface Env {
    Bindings: {
    },
    Variables: {
        STUB: DurableObjectStub<VotingObject>
        CLERK_SECRET_KEY: string
        VOTING_OBJECT: DurableObjectNamespace<VotingObject>
    }
}

export const factory = createFactory<Env>();

export const app = factory.createApp();