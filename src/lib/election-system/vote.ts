import { Candidate, Seat } from "./types";

/*
The vote class maintains all the state for a single vote. This includes the
voter ID (seat), the value of the vote as it's transferred between preferences, 
and the list of candidates in preferential order.
*/
export default class Vote {
  public seat: Seat;
  public value: number = 1;

  private _candidates: Candidate[];

  constructor(seat: Seat, votes: Candidate[]) {
    this.seat = seat;
    this._candidates = votes;
  }

  get candidates() {
    return this._candidates.slice();
  }

  get first() {
    return this._candidates.at(0);
  }

  // Sets and returns the next candidate for this vote
  next(): Candidate | undefined {
    this._candidates = this._candidates.slice(1);
    return this.first;
  }

  /** 
   * Returns the next candidate that will get this vote out of a set of
   * remaining candidates. Could be used to perform forward-looking tie break.
   * 
   * @deprecated This isn't and probably shouldn't be used. We couldn't find
   * forward looking tie-breaks in common election procedures while researching 
   * this feature.
   */
  nextEffectiveVote(remainingCandidates: Set<Candidate>) {
    for (let c of this.candidates) {
      if (remainingCandidates.has(c)) {
        return c;
      }
    }
  }
}
