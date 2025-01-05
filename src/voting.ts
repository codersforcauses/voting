import { DurableObject } from 'cloudflare:workers';

export class VotingObject extends DurableObject {
  async sayHello() {
    let result = this.ctx.storage.sql
      .exec("SELECT 'Hello, World!' as greeting")
      .one();
    return result.greeting;
  }
} 