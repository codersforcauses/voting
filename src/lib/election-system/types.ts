import Vote from "./vote";

type Candidate = number;
type Seat = string;
type Count = {
  candidate: Candidate;
  count: number;
};
type TransferValue = {
  candidate: Candidate;
  tv: number;
  votes: Vote[];
  count: number;
};

interface Sortable {
  count: number;
  candidate: Candidate;
}

export { Candidate, Seat, Count, Sortable, TransferValue };
