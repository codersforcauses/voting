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

type Transfer = {
  from: Candidate;
  votes: number;
  weight: number;
};

type TallyEntry = {
  count: number;
  transfers: Transfer[];
};

interface Sortable {
  count: number;
  candidate: Candidate;
}

export type { Candidate, Seat, Count, Sortable, TransferValue, Transfer, TallyEntry };
