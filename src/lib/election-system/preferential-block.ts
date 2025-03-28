import Race from "./race";
import { Candidate, Count, Seat, TransferValue } from "./types";
import Vote from "./vote";

/**
  Preferential Block Voting is a multi-position election system which is the 
  block-voting equivalent to instant-runoff voting. This system favours the 
  majority unlike a proportional representation system like Hare-Clark
*/
export default class PreferentialBlock extends Race {
  openings: number;

  constructor(
    votes: Record<Seat, Candidate[]>,
    openings: number = 1
  ) {
    super(votes);
    if (this.candidates.size < openings) {
      throw new Error(`Not enough candidates, ${this.candidates.size} candidates \
        for ${openings} openings`)
    }
    this.openings = openings;
  }

  /**
   */
  count() {
  }
  
  /**
   * Sets the vote to the next preference that has not been eliminated or 
   * elected in the current race. If no preference is available, the vote is 
   * discarded.
   */
  private nextValidPreference(v: Vote): void {
    let next;
    do {
      next = v.next();
      if (next && this.candidates.has(next)) {
        let tmp = this.candidates.get(next) ?? [];
        tmp.push(v);
        this.candidates.set(next, tmp);

        return;
      }
    } while (next); // If next is undefined it means there's no more candidates
    return; // Vote is discarded
  }

  /**
   * Checks whether any candidate's vote count exceeds the quota. If so, deletes 
   * the candidate from this.candidates (the candidate map).
   */
  private findElectedCandidates(count: Count[], quota: number): TransferValue[] {
    let elected: TransferValue[] = [];

    for (const c of count) {
      if (c.count >= quota) {
        elected.push({
          candidate: c.candidate,
          tv: -1,
          votes: this.candidates.get(c.candidate)!,
          count: c.count,
        });
        this.candidates.delete(c.candidate);
      } else if (c.count < quota && c.count > quota - 0.1) {
        console.warn("WARNING POSSIBLE FLOAT ARTEFACT: ", c);
      }
    }
    return elected;
  }

  /** 
   * Moves all the votes of an elected candidate to the next preference.
   */
  private transferElectedVotes(buffer: TransferValue[]) {
    // A candidate was elected so transfer their votes to the next candidate
    for (let c of buffer) {
      if (c.tv > 0) {
        for (let v of c.votes) {
          v.value *= c.tv;
          this.nextValidPreference(v);
        }
      }
    }
  }

  /**
   * Finds the candidate with the least votes (using tie-breakers from parent 
   * class), then moves all the votes to the next valid preference at full 
   * value.
   * Candidate is then eliminated and removed from this.candidates 
   * (the candidate map).
   */
  private transferEliminatedVotes(count: Count[]) {
    const minCandidate = count.reduce(this.reduce.bind(this));
    const candidateVotes = this.candidates.get(minCandidate.candidate)!;
    this.candidates.delete(minCandidate.candidate);

    for (let v of candidateVotes) {
      this.nextValidPreference(v);
    }
  }
}
