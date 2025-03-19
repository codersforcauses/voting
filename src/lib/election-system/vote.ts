import { Candidate, Seat } from "./types";
/*


*/
export default class Vote {
  public seat: Seat;
  public value: number = 1;

  // The private _candidates is the reversed array
  // use the candidates getter to access the in-order preferences
  private _candidates: Candidate[];

  constructor(seat: Seat, votes: Candidate[]) {
    this.seat = seat;
    this._candidates = votes;
  }

  get candidates() {
    return this._candidates.slice();
  }

  // Returns the effective first preference
  get first() {
    return this._candidates.at(0);
  }

  next(): Candidate | undefined {
    // TODO: This one might scream at us when there's no items in the list
    // (or one item left)
    this._candidates = this._candidates.slice(1);
    return this.first;
  }

  // Returns the next candidate that will get this vote out of a set of
  // remaining candidates. Used to tie-break step 5 when two candidates have
  // the same votes and we need to decide which candidate to remove from the
  // count.
  nextEffectiveVote(remainingCandidates: Set<Candidate>) {
    for (let c of this.candidates) {
      if (remainingCandidates.has(c)) {
        return c;
      }
    }
  }
}
