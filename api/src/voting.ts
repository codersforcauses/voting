import { Env } from "./config";
import { Command } from "./types";

export class VotingServer implements DurableObject {
	state: DurableObjectState
	env: Env

	constructor(state: DurableObjectState, env: Env) {
		this.state = state
		this.env = env
	}

	async fetch(request: Request) {
		const url = new URL(request.url)
		const command = url.pathname.split("/")[1]
		console.log(command)
		console.log(Command.StartRoom)
		if (!command) return new Response(JSON.stringify({ message: "No command found" }), { status: 400 })
		let message;
		switch(command) {
			case Command.StartRoom:
				message = "Starting room"
				break
			case Command.StartVote:
				message = "Starting Vote"
				break
			case Command.EndVote:
				message = "Ending Vote"
				break
			case Command.AddSeat:
				message = "Adding Seat"
				break
			case Command.FillSeat:
				message = "Filling Seat"
				break
			case Command.Vote:
				message = "Voting"
				break
			default:
				return new Response(JSON.stringify({ message: "Invalid command" }), { status: 400 })
			}
			return new Response(JSON.stringify({ message }), { status: 200 })
	}
}

export class VotingClient {
	env: Env
	vote: DurableObjectStub

	constructor(env: Env) {
		this.env = env
		const voteId = env.VOTE_SERVER.idFromName('vote')
		this.vote = env.VOTE_SERVER.get(voteId)
	}
}
