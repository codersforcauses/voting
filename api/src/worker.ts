import { Env } from './config'

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      let id: DurableObjectId = env.WEBSOCKET_SERVER.idFromName("cfc");
      let stub: DurableObjectStub = env.WEBSOCKET_SERVER.get(id);

      return await stub.fetch(request);
    }
};
