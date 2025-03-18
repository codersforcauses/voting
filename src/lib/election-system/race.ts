/*

Preference  | 1    2
Person 1 -> ["A", "B"]
Person 2 -> ["B", "C"]


Candidate | Count
A         | 1
B         | 1
*/

import { Candidate, Count, Seat, Sortable } from "./types";
import Vote from "./vote";

export default class Race {
  candidates: Map<Candidate, Vote[]> = new Map();
  votes: Map<Seat, Vote> = new Map();

  constructor(votes: Map<string, string[]> | Record<string, string[]>) {
    // Convert the type if we get a record instead of a map
    // This is used for the testing procedures since records are easier to create
    if (!(votes instanceof Map)) {
      votes = new Map<string, string[]>(Object.entries(votes));
    }

    for (const [key, value] of votes) {
      let vote = new Vote(key, value);
      this.votes.set(key, vote);

      // Ensures each candidate in this vote has an initialised array in the map
      for (let c of vote.candidates) {
        let tmp = this.candidates.get(c) ?? [];
        this.candidates.set(c, tmp);
      }
      // Add the first preference vote to the correct candidate
      this.candidates.get(vote.first!)?.push(vote);
    }
  }

  // Counts the number of current-preference votes for each candidate
  countVotes() {
    let result: Count[] = [];

    for (let [c, votes] of this.candidates) {
      let count = 0;

      for (let v of votes) {
        count += v.value;
      }
      result.push({
        candidate: c,
        count: count,
      });
    }
    return result;
  }

  sort(i: Sortable, k: Sortable) {
    // if (i.count < k.count) return i;
    // if (k.count < i.count) return k;

    return i.count - k.count;
  }

  reduce<T extends Sortable>(i: T, k: T) {
    if (i.count < k.count) return i;
    if (k.count < i.count) return k;

    return this.tieBreaker(i, k) > 0 ? i : k;
  }

  tieBreaker(i: Sortable, k: Sortable) {
    // console.log(i, k);
    // Perform count back - if no count back breaks the tie then rely on random
    // tie breaker. It's possible to simulate several elections if it's favourable
    // to award the win to the most probable candidate.

    // Select by random lot
    return getRandomInt(2);
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
