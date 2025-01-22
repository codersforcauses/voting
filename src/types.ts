import { VotingObject } from "./models";

export type Env = {
  Bindings: {
    VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
  },
  Variables: {
    stub: DurableObjectStub<VotingObject>
  }
}