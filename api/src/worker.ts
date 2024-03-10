import { Env } from './config'

export const WebSocketWorker = {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      // This example will always refer to the same Durable Object instance,
      // since the name "foo" is hardcoded.
      let id: DurableObjectId = env.WEBSOCKET_HIBERNATION_SERVER.idFromName("foo");
      let stub: DurableObjectStub = env.WEBSOCKET_HIBERNATION_SERVER.get(id);
  
      // Forward the request to the Durable Object and wait for the Response.
      return await stub.fetch(request);
    }
};