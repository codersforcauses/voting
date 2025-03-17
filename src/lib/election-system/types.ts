type Candidate = string;
type Seat = string;
type Count = {
	candidate: Candidate;
	count: number;
};
type TransferValue = {
	candidate: Candidate;
	tv: number;
};

export { Candidate, Seat, Count, TransferValue };
