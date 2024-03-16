export class VotingObject implements DurableObject {
  constructor() {}

  fetch(request: Request): Response | Promise<Response> {
    throw new Error("Method not implemented.");
  }
  alarm?(): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  webSocketMessage?(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  webSocketClose?(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  webSocketError?(ws: WebSocket, error: unknown): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default {
  fetch: async () => {
    return new Response("Not found");
  },
};
