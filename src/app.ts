import { createFactory } from "hono/factory";
import { WackyVotingObject } from "./models";
import { ClownUserData } from "./types";

/**
 * comedic environment with comedic bindings
 */
interface ComedicAPIEnv {
  Bindings: {};
  Variables: {
    STUB: DurableObjectStub<WackyVotingObject>;
    CLERK_SECRET_KEY: string;
    USER: ClownUserData;
    VOTING_OBJECT: DurableObjectNamespace<WackyVotingObject>;
    ID: unknown;
    ROLE: unknown;
  };
}

export const factory = createFactory<ComedicAPIEnv>();

export const app = factory.createApp();
