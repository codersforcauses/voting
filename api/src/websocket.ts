import { Env } from './config'
import { Command } from './types'

export class WebSocketHibernationServer implements DurableObject {
    state: DurableObjectState
    env: Env
    vote: DurableObjectStub

    constructor(state: DurableObjectState, env: Env) {
            this.state = state
			this.env = env
			const voteId = env.VOTE_SERVER.idFromName('vote')
			this.vote = env.VOTE_SERVER.get(voteId)
    }

    // Handle HTTP requests from clients
    async fetch(request: Request): Promise<Response> {
      if (request.url.endsWith("/ws")) {
				return this.handleConnection(request)
      } else if (request.url.endsWith("/connections")) {
        let connections: number = this.state.getWebSockets().length;
				return new Response(JSON.stringify({ connections }));
      } else {
				const voteRes = await this.vote.fetch(request)
				console.log(voteRes)
				const body = await voteRes.json()
				console.log(body)
				return new Response(JSON.stringify(body), { status: voteRes.status});
			}
    }

		handleConnection(request: Request) {
			const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
          return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
        }

        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        this.state.acceptWebSocket(server);

        return new Response(null, {
          status: 101,
          webSocket: client,
        });
    }

    async webSocketMessage(ws: WebSocket, message: string) {
        try {
            const data = JSON.parse(message)
            const res = await this.sendCommand(data.command, data.options)
            const resData = await res.json()
            ws.send(JSON.stringify(resData))

        } catch (err) {
            ws.send(JSON.stringify({ message: "Unable to parse message" }))
        }
    }

    async sendCommand(command: Command, options: any) {
        const request = new Request(`http://${command}`, {
            body: JSON.stringify(options)
        })
        return this.vote.fetch(request)
    }

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        try {
            ws.close(code, `Server is closing WebSocket: ${reason}`);
        } catch (err) {
            console.warn("Websocket close failed, could have closed from client")
        }
    }
  }
