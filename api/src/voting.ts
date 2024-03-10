import { Env } from "./config";
import { Commands } from "./types";

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
		console.log(Commands.StartRoom)
		if (!command) return new Response(JSON.stringify({ message: "No command found" }), { status: 400 })
		let message;
		switch(command) {
			case Commands.StartRoom:
				message = "Starting room"
				break
			case Commands.StartVote:
				message = "Starting Vote"
				break
			case Commands.EndVote:
				message = "Ending Vote"
				break
			case Commands.AddSeat:
				message = "Adding Seat"
				break
			case Commands.FillSeat:
				message = "Filling Seat"
				break
			case Commands.Vote:
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
