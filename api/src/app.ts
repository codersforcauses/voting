import { createFactory } from "hono/factory";
import { VotingObject } from "./models";
import { UserData } from "./types";

interface APIEnv {
  Bindings: {};
  Variables: {
    STUB: DurableObjectStub<VotingObject>;
    CLERK_SECRET_KEY: string;
    USER: UserData;
    VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
    ID: unknown;
    ROLE: unknown;
  };
}

export const factory = createFactory<APIEnv>();

export const app = factory.createApp();
