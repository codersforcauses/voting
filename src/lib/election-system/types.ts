import Vote from "./vote";

type Candidate = string;
type Seat = string;
type Count = {
	candidate: Candidate;
	count: number;
};
type TransferValue = {
	candidate: Candidate;
	tv: number;
	votes: Vote[];
};

export { Candidate, Seat, Count, TransferValue };
