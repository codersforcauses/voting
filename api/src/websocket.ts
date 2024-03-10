import { Env } from './config'

export class WebSocketHibernationServer {
    state: DurableObjectState;
  
    constructor(state: DurableObjectState, env: Env) {
      this.state = state;
    }
  
    // Handle HTTP requests from clients.
    async fetch(request: Request): Promise<Response> {
      if (request.url.endsWith("/ws")) {
        // Expect to receive a WebSocket Upgrade request.
        // If there is one, accept the request and return a WebSocket Response.
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
          return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
        }
  
        // Creates two ends of a WebSocket connection.
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
  
        // Calling `acceptWebSocket()` tells the runtime that this WebSocket is to begin terminating
        // request within the Durable Object. It has the effect of "accepting" the connection,
        // and allowing the WebSocket to send and receive messages.
        // Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
        // is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
        // the connection is open. During periods of inactivity, the Durable Object can be evicted
        // from memory, but the WebSocket connection will remain open. If at some later point the
        // WebSocket receives a message, the runtime will recreate the Durable Object
        // (run the `constructor`) and deliver the message to the appropriate handler.
        this.state.acceptWebSocket(server);
  
        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      } else if (request.url.endsWith("/getCurrentConnections")) {
        // Retrieves all currently connected websockets accepted via `acceptWebSocket()`.
        let numConnections: number = this.state.getWebSockets().length;
        if (numConnections == 1) {
          return new Response(`There is ${numConnections} WebSocket client connected to this Durable Object instance.`);
        }
        return new Response(`There are ${numConnections} WebSocket clients connected to this Durable Object instance.`);
      }
  
      // Unknown path, reply with usage info.
      return new Response(`
  This Durable Object supports the following endpoints:
    /ws
      - Creates a WebSocket connection. Any messages sent to it are echoed with a prefix.
    /getCurrentConnections
      - A regular HTTP GET endpoint that returns the number of currently connected WebSocket clients.
  `)
    }
  
    async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
      console.log(message)
      // Upon receiving a message from the client, reply with the same message,
      // but will prefix the message with "[Durable Object]: ".
      ws.send(`[Durable Object]: ${message}`);
    }
  
    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
      // If the client closes the connection, the runtime will invoke the webSocketClose() handler.
      ws.close(code, "Durable Object is closing WebSocket");
    }
  }
  