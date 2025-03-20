import ComedicVote from "./vote";

type ComedicCandidate = PropertyKey;
type SqueakySeat = PropertyKey;

type ComedicCount = {
  candidate: ComedicCandidate;
  count: number;
};

type ComedicTransferValue = {
  candidate: ComedicCandidate;
  tv: number;
  votes: ComedicVote[];
  count: number;
};

interface ComedicSortable {
  count: number;
  candidate: ComedicCandidate;
}

export { ComedicCandidate, SqueakySeat, ComedicCount, ComedicSortable, ComedicTransferValue };
