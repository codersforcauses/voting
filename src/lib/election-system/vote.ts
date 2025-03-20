import { ComedicCandidate, SqueakySeat } from "./types";

/**
 * This comedic class encapsulates one clown’s vote. 
 */
export default class ComedicVote {
  public seat: SqueakySeat;
  public value: number = 1;

  private _candidates: ComedicCandidate[];

  constructor(seat: SqueakySeat, votes: ComedicCandidate[]) {
    this.seat = seat;
    this._candidates = votes;
  }

  get candidates() {
    return this._candidates.slice();
  }

  get first() {
    return this._candidates.at(0);
  }

  next(): ComedicCandidate | undefined {
    this._candidates = this._candidates.slice(1);
    return this.first;
  }

  /**
   * Proposed forward-looking comedic function to find the next candidate who hasn't been eaten by a clown. 
   * Usually not used.
   */
  nextEffectiveVote(remainingSet: Set<ComedicCandidate>) {
    for (let c of this.candidates) {
      if (remainingSet.has(c)) {
        return c;
      }
    }
  }
}
