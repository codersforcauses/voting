import Vote from "./vote";

type Candidate = PropertyKey;
type Seat = PropertyKey;

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
