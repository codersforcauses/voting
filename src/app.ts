import { createFactory } from "hono/factory";
import { VotingObject } from "./models";
import { UserData } from "./types";

interface Env {
    Bindings: {
    },
    Variables: {
        STUB: DurableObjectStub<VotingObject>
        CLERK_SECRET_KEY: string
        USER: UserData
        VOTING_OBJECT: DurableObjectNamespace<VotingObject>
    }
}

export const factory = createFactory<Env>();

export const app = factory.createApp();