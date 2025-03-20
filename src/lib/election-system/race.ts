import { Candidate, Count, Seat, Sortable } from "./types";
import Vote from "./vote";

/**
 The Race class is responsible for storing candidate, vote, and count back
 information for an election race (implemented with a specific algorithm, such
 as hare-clark or instant-runoff).
 
 Race also handles features common to all races, like counting votes, sorting
 candidates, and breaking ties (though it would be possible that a particular
 election system overwrites the tie-breaking mechanism)
 
 ## Data structures
 
 ### Vote map
 Seat ID: [preference list]
 {
   "010123": [A, C, B],
   "193343": [A],
   "845212": [B, C, A]
 }
 
 ### Candidate map
 Note that the candidate map contains all initial candidates even if they
 receive no first preference votes.
 
 Candidate ID: [Votes]
 {
   A: [ Vote("010123", 1.0, ["A", C", "B"]), Vote("193343", 0.5, ["A"]) ],
   B: [ Vote("845212", 1.0, ["B", "C", "A"])],
   C: []
 }
 
 ### Count back
 Most recent count last.
 [
   { A: 2, B: 1, C: 0 },
 ]
 
 ## Choosing an Election System
 Note [4] has a good range of information about different election-systems.
 
 You can evaluate election systems with a range of criterions but there's no
 perfect system. The best choice is probably one that is simple and the voters 
 are familiar with. 
 
 ### Resolvability
 One criterion that's important for small club elections is the resolvability
 criterion. The criterion states that "the probability of an exact tie must 
 diminish as more votes are cast". This is important because club elections tend
 to not have many votes, which might mean there's a higher chance of a tie.
 
 If the clubs rules allow for it, it may be better to opt for a different method
 to increase the resolvability of an election, rather than relying on tiebreaks 
 that might fall down to random chance.
 
 ## Tie-Breaking Mechanism
  
 We've implemented the tie-breaking system commonly used in Australia. This
 system is used for federal elections [1, 2]. It's also common to hare-clark
 elections [3] (where it's explained more simply).
  
 This system breaks ties as follows:
 1. Look to previous counts to break the tie. The candidate with more total
    votes in a previous count wins.
 2. If there is no previous count where one candidate has more total votes (or
    if there is no previous count) the winner is determined by lot (random draw)
    
 This can introduce a lot of uncertainty in elections where there's lots of 
 ties. This *should* be rare (though it's more common the smaller the election -
 see above). However, changing the tie-breaking mechanism can substantially
 alter the characteristics of the election and requires *lots* of research.
 
 Failing all other appropriate means, I suggest a fight to the death.
 
 ______________
 [1] Commonwealth Electoral Act 1918 (Cth) s 273(29) meaning of Unbreakable Tie
 [2] Commonwealth Electoral Act 1918 (Cth) s 273(29A)

 [3] Electoral Act 1992 (ACT) Sch 4, Cl 8 
 <https://www5.austlii.edu.au/au/legis/act/consol_act/ea1992103/sch4.html>
 
 [4] https://en.wikipedia.org/wiki/Comparison_of_voting_rules
*/
export default class Race {
  candidates: Map<Candidate, Vote[]> = new Map();
  votes: Map<Seat, Vote> = new Map();
  countback: Map<Candidate, number>[] = [];

  protected constructor(votes: Map<Seat, Candidate[]> | Record<Seat, Candidate[]>) {
    // Convert the type if we get a record instead of a map
    // This is used for the testing procedures since records are easier to create
    if (!(votes instanceof Map)) {
      votes = new Map<Seat, Candidate[]>(Object.entries(votes));
    }

    for (const [key, value] of votes) {
      let vote = new Vote(key, value);
      this.votes.set(key, vote);

      // Ensures each candidate in this vote has an initialised array in the map
      // even if they have no first-preferences.
      for (let c of vote.candidates) {
        let tmp = this.candidates.get(c) ?? [];
        this.candidates.set(c, tmp);
      }
      // Add the first preference vote to the correct candidate
      this.candidates.get(vote.first!)?.push(vote);
    }
  }

  /**
   * Counts the total votes held by each candidate currently. Votes with a
   * reduced transfer value are summed at their present value.
   */
  protected countVotes() {
    let result: Count[] = [];
    let cb = new Map<Candidate, number>();
    for (let [c, votes] of this.candidates) {
      let count = 0;

      for (let v of votes) {
        count += v.value;
      }
      result.push({
        candidate: c,
        count: count,
      });
      cb.set(c, count);
    }

    this.countback.push(cb);
    return result;
  }

  protected sort(i: Sortable, k: Sortable) {
    const diff = i.count - k.count;
    if (diff == 0) {
      const tie = this.tieBreaker(i, k);
      if (tie == 0) return -1;
      return 1;
    }
    return diff;
  }

  protected reduce<T extends Sortable>(i: T, k: T) {
    if (i.count < k.count) return i;
    if (k.count < i.count) return k;

    return this.tieBreaker(i, k) > 0 ? i : k;
  }

  /** 
   * Performs a search over the previous counts to see if one might break the 
   * tie - if no count-back breaks the tie, then the candidate is selected by 
   * lot (random draw).
   */
  protected tieBreaker(i: Sortable, k: Sortable) {
    for (let previous of this.countback.toReversed()) {
      let a = previous.get(i.candidate)!;
      let b = previous.get(k.candidate)!;
      if (a < b) return 0;
      if (b < a) return 1;
    }

    // Select by random lot
    return getRandomInt(2);
  }
}

function getRandomInt(max: number) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

