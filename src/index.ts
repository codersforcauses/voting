import { app } from "./controllers";
import { stubContext } from "./middleware";
import { Env, VotingObject } from "./models";

export default {
  async fetch(request, env, ctx) {
      app.use(stubContext(env))
      return app.fetch(request, env, ctx)
  }
} satisfies ExportedHandler<Env>;

export { VotingObject }