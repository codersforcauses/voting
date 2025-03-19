import Race from "./race";
import { Candidate, Count, Seat, TransferValue } from "./types";
import Vote from "./vote";

/**
 Hare-Clark is a Single Transferable Vote (STV) Proportional Representation (PR)
 election system. It's used in Tasmania and the ACT [1]. A variant of Hare-Clark
 is used in the Australian Senate [2].
 
 Hare-Clark allows a single race to elect candidates into more than one
 position; something that instant-runoff does not. See `## Use for Instant-
 Runoff voting` to see why this works for both methods anyway.
 
 ## Contents
 - Method
 - Transfers to candidates with no first-preference votes
 - Use for Instant-Runoff Voting (IRV)
 - Rounding
 - Notes
 
 ## Method: [1]
 
 1. Determining the quota
  - The total count of valid votes is used to calculate the quota required to be 
    declared elected. We use the Droop Quota here [3].
 
 2. Count
  - The current first preferences from each ballot paper is tallied.
  - On the first count, this is the first preference for each vote.
  - On subsequent counts, the current first preference is the next valid
    preference from eliminated or elected candidates.
  
 3. Declaring candidates elected
  - Candidates who have more than the required quota of votes are elected. Note
    that it's possible too many candidates are declared elected if they're the
    last remaining candidates. The tie should be broken with a suitable means. 
    (see tie-breaking on the Race class)
    
 4. Surplus Votes
  - When a candidate is elected, their votes are distributed to the voters' next
    preference in proportion to the surplus votes received.
  - Calculate transfer value:
    transfer value = ( surplus votes / last parcel of votes received )
  - Distribute preferences
    Value of distributed preferences is multiplied by the transfer value as it's
    shared.
    
    ie:
      Candidate PLATYPUS has 3,000 first preference votes, which is a 499 
      surplus above the quota.
      
      Transfer value(x)=(499/3000)
      (x)=0.17

      The transfer value from PLATYPUS is 0.17.
      
 5. Recount
  - Return to step 2 and recount the votes. If no candidate has reached the
    quota and there are still vacancies, the candidate with the lowest current
    vote is eliminated. The preferences of this candidate are distributed to the
    next usable preference at full value, then return to step 2.
  - See the Race class for details on tie breaking the lowest candidate.
  
  The count is complete when the number of candidates remaining is the same as
  the remaining vacancies or when all candidates are elected.
  
  ## Transfers to candidates with no first-preference votes
  All candidates are eligible for a transfer until they're eliminated. 
  Candidates with no first-preference votes are usually the first to be
  eliminated, unless a candidate is elected on the first count and they receive
  transferred votes.
  
  ### This means that in the election (electing 2):
  v1: [C, B, A]
  v2: [A, B, C]
  v3: [A, B, C]
  v4: [A, B, C]
  v5: [A, B, C]
  
  Quota: 2 = Ceil( 5 / (2 + 1))
   
  Count 1: A: 4, C: 1: B: 0
  - A is elected. 4 Votes transferred at 0.5 value to B
  
  Count 2: A: Elected, B: 2, C: 1
  - B is elected despite receiving no first-preference votes
  
  Result: [A, B]
  
  ### Conversely, in this election (electing 2):
  v1: [A, B, C]
  v2: [D, A, C]
  v3: [E, A, C]
  v4: [F, B, C]
  v5: [G, B, C]
  
  Quota: 2 = Ceil( 5 / (2 + 1)) // Same
   
  Count 1: A: 1, B: 0: C: 0, D: 1, E: 1, F: 1, G: 1
  - No candidate has enough votes to be elected.
  - Lowest is eliminated (C). C has no votes so they're not transferred.
  
  Count 2: A: 1, B: 0: C: -, D: 1, E: 1, F: 1, G: 1
  - No candidate has enough votes to be elected.
  - Lowest is eliminated (B). B has no votes so they're not transferred.
  
  Count 3: A: 1, B: -: C: -, D: 1, E: 1, F: 1, G: 1
  - No candidate has enough votes to be elected.
  - No earlier count breaks tie. Tie broken by lot
  - D eliminated (random chance)
  - D's vote transferred to A
  
  Count 4: A: 2, B: -: C: -, D: -, E: 1, F: 1, G: 1
  - A is elected. No surplus votes
  
  Count 5: A: Elected, B: -: C: -, D: -, E: 1, F: 1, G: 1
  - No candidate has enough votes to be elected.
  - No earlier count breaks tie. Tie broken by lot
  - F eliminated (random chance)
  - B & C are already eliminated. Vote discarded.
  
  Count 6: A: Elected, B: -: C: -, D: -, E: 1, F: -, G: 1
  - No candidate has enough votes to be elected.
  - No earlier count breaks tie. Tie broken by lot
  - G eliminated (random chance)
  - B & C are already eliminated. Vote discarded.
  
  Count 7: A: Elected, B: -: C: -, D: -, E: 1, F: -, G: -
  - No candidate has enough votes to be elected.
  - No earlier count breaks tie. Tie broken by lot
  - G eliminated (random chance)
  - B & C are already eliminated. Vote discarded.
  - Only one candidate remains. E Elected.
  
  Result: [A, E]
  
  * Note * 
  Real elections are less contrived and the chance of a random 
  tie-breaker diminishes with the more votes in an election. See the tie-breaker
  discussion on the Race class.
  
  ## Use for Instant-Runoff Voting (IRV)
  The instant-runoff voting method looks very different because it elects only 
  one candidate. However, in practice it's much simpler, and Hare-Clark turns
  out to be a superset of the IRV procedure.
  
  The transfer value is ignored, because with only one position, the system 
  exits as soon as that candidate is elected. The transfer from min candidates 
  is the same procedure.Because The system requires the elected candidate to 
  have more than 50% of the votes (which looks a lot like the droop quota for a 
  single candidate), eliminates the candidate with the least first-preference 
  votes, and distributes those  preferences at full value. This process is 
  repeated until a candidate exceeds the quota.
  
  ## Rounding
  Some election systems round or truncate the fractional values. Tasmania
  rounds to 6 decimal places. The Australian senate truncates any decimal 
  places. 
  
  This system doesn't round because we're not counting by hand. We're using also
  using floating point numbers which may introduce some errors to the 
  count, but so far this hasn't made an observed impact.
  
  __________
  [1] - https://en.wikipedia.org/wiki/Hare–Clark_electoral_system
  [2] - https://en.wikipedia.org/wiki/Single_transferable_vote#Australia
  [3] - https://en.wikipedia.org/wiki/Droop_quota
*/
export default class HareClark extends Race {
  parcels: Map<Candidate, number> = new Map();
  openings: number;

  constructor(
    votes: Map<Seat, Candidate[]> | Record<Seat, Candidate[]>,
    openings: number = 2
  ) {
    super(votes);
    this.openings = openings;
  }

  /**
   * The main count function. Returns the array of elected candidates (with 
   * some metadata). To access the full tally of all counts get `this.countback`
   * after calling this method.
   */
  count(): TransferValue[] {
    let elected: TransferValue[] = [];
    const quota = Math.floor(this.votes.size / (this.openings + 1)) + 1;

    while (elected.length < this.openings) {
      let count = this.countVotes();
      let buffer = this.findElectedCandidates(count, quota);

      // Do we have enough positions?
      // This is our chance to early exit (and maybe break ties)
      let total = elected.length + buffer.length;
      if (total > this.openings) {
        // Tie Break by sorting vote value
        buffer.sort(this.sort.bind(this));
        const cut = this.openings - elected.length;
        elected = elected.concat(buffer.slice(buffer.length - cut));
        break;
      }

      elected = elected.concat(buffer);
      if (total == this.openings) {
        break;
      }

      // If the number of remaining completes all openings, we should exit early
      // It's possible a successful candidate never hits quota (if there's
      // insufficient follow-on preferences).
      if (elected.length + this.candidates.size == this.openings) {
        const remaining = []
        for (let [c, votes] of this.candidates.entries()) {
          remaining.push({
            candidate: c,
            count: -1,
            tv: 0,
            votes: votes
          })
        }
        elected = elected.concat(remaining);
        break;
      }

      // Clear parcel
      this.parcels.clear();

      // Transfer votes
      if (buffer.length > 0) {
        this.transferElectedVotes(buffer);
      } else {
        this.transferEliminatedVotes(count);
      }
    }
    return elected;
  }

  /**
   * Sets the vote to the next preference that has not been eliminated or 
   * elected in the current race. If no preference is available, the vote is 
   * discarded. Saves votes to the new candidate's parcel so transfer value
   * can be calculated later.
   */
  private nextValidPreference(v: Vote): void {
    let next;
    do {
      next = v.next();
      if (next && this.candidates.has(next)) {
        let tmp = this.candidates.get(next) ?? [];
        tmp.push(v);
        this.candidates.set(next, tmp);

        // Update the latest parcel
        const p = this.parcels.get(next) ?? 0;
        this.parcels.set(next, p + v.value);
        return;
      }
    } while (next); // If next is undefined it means there's no more candidates
    return; // Vote is discarded
  }

  /**
   * Checks whether any candidate's vote count exceeds the quota. If so,
   * calculates the transfer value and deletes the candidate from 
   * this.candidates (the candidate map).
   */
  private findElectedCandidates(count: Count[], quota: number): TransferValue[] {
    let elected: TransferValue[] = [];

    for (const c of count) {
      if (c.count >= quota) {
        const lastParcel = this.parcels.get(c.candidate) ?? c.count;
        const transferValue = (c.count - quota) / lastParcel;

        elected.push({
          candidate: c.candidate,
          tv: transferValue,
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
   * Moves all the votes of an elected candidate to the next preference. Each
   * votes' value is diminished by the transfer value.
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
