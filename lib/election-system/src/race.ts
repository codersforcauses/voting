import type { Candidate, Count, Seat, Sortable, TallyEntry, Transfer } from "./types";
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
  countback: Map<Candidate, TallyEntry>[] = [];
  protected pendingTransfers: Map<Candidate, Transfer[]> = new Map();

  protected constructor(votes: Record<Seat, Candidate[]>) {
    // Convert the type if we get a record instead of a map
    // This is used for the testing procedures since records are easier to create
    const mapVotes = new Map<Seat, Candidate[]>(Object.entries(votes));

    for (const [key, value] of mapVotes) {
      const vote = new Vote(key, value);
      this.votes.set(key, vote);

      // Ensures each candidate in this vote has an initialised array in the map
      // even if they have no first-preferences.
      for (const c of vote.candidates) {
        const tmp = this.candidates.get(c) ?? [];
        this.candidates.set(c, tmp);
      }
      // Add the first preference vote to the correct candidate
      this.candidates.get(vote.first!)?.push(vote);
    }
  }

  protected recordTransfer(to: Candidate, from: Candidate, votes: number, weight: number) {
    const transfers = this.pendingTransfers.get(to) ?? [];
    transfers.push({ from, votes, weight });
    this.pendingTransfers.set(to, transfers);
  }

  /**
   * Counts the total votes held by each candidate currently. Votes with a
   * reduced transfer value are summed at their present value.
   */
  protected countVotes() {
    const result: Count[] = [];
    const cb = new Map<Candidate, TallyEntry>();
    for (const [c, votes] of this.candidates) {
      let count = 0;

      for (const v of votes) {
        count += v.value;
      }
      result.push({
        candidate: c,
        count: count,
      });

      // Aggregate pending transfers by source candidate
      const rawTransfers = this.pendingTransfers.get(c) ?? [];
      const aggregated = new Map<Candidate, { votes: number; totalValue: number }>();
      for (const t of rawTransfers) {
        const existing = aggregated.get(t.from);
        if (existing) {
          existing.votes += t.votes;
          existing.totalValue += t.votes * t.weight;
        } else {
          aggregated.set(t.from, { votes: t.votes, totalValue: t.votes * t.weight });
        }
      }
      const transfers: Transfer[] = Array.from(aggregated.entries()).map(([from, agg]) => ({
        from,
        votes: agg.votes,
        weight: agg.votes > 0 ? agg.totalValue / agg.votes : 0,
      }));

      cb.set(c, { count, transfers });
    }

    this.countback.push(cb);
    this.pendingTransfers = new Map();
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
    for (const previous of this.countback.toReversed()) {
      const a = previous.get(i.candidate)!.count;
      const b = previous.get(k.candidate)!.count;
      if (a < b) return 0;
      if (b < a) return 1;
    }

    // Select by random lot
    return getRandomInt(2);
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
