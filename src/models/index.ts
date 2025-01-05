import { DurableObject } from 'cloudflare:workers';

export interface Env {
  VOTING_OBJECT: DurableObjectNamespace<VotingObject>;
}

export class VotingObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    // Required, as we're extending the base class.
    super(ctx, env)
  }

  async sayHello() {
    let result = this.ctx.storage.sql
      .exec("SELECT 'Hello, World!' as greeting")
      .one();
    return result.greeting;
  }
} 