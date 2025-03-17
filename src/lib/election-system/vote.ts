/*


*/
export default class Vote {
  public seat: string;
  public value: number = 1;

  // The private _candidates is the reversed array
  // use the candidates getter to access the in-order preferences
  private _candidates: string[];

  constructor(seat: string, votes: string[]) {
    this.seat = seat;
    this._candidates = votes.toReversed();
  }

  get candidates() {
    return this._candidates.toReversed();
  }

  // Returns the effective first preference
  get first() {
    return this._candidates.at(-1);
  }

  next(): string | undefined {
    // TODO: This one might scream at us when there's no items in the list
    // (or one item left)
    this._candidates.pop();
    return this.first;
  }

  // Returns the next candidate that will get this vote out of a set of
  // remaining candidates. Used to tie-break step 5 when two candidates have
  // the same votes and we need to decide which candidate to remove from the
  // count.
  nextEffectiveVote(remainingCandidates: Set<string>) {
    for (let c of this.candidates) {
      if (remainingCandidates.has(c)) {
        return c;
      }
    }
  }
}
