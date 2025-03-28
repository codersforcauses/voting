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
   * 
   */
  count() {
    while (this.candidates.size > this.openings) {
      // todo : work out how to count the votes properly for this method.
      // inheriting from the race class was maybe the wrong abstraction.
      
      let count = this.countVotes()
      this.transferEliminatedVotes(count)
    }
    
    let elected = []
    
    for (let [c, votes] of this.candidates) {
      elected.push({
        candidate: c,
        count: votes.length,
        tv: -1,
        votes: votes,
      })
    }
    
    return elected
  }
  
  /**
   * Sets the vote to the next preference that has not been eliminated
   * in the current race. If no preference is available, the vote is 
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
