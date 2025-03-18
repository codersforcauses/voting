import { Candidate, Count, Seat } from "./types";
import Vote from "./vote";

export default class Race {
  candidateVotes: Map<Candidate, Vote[]> = new Map();
  candidateParcel: Map<Candidate, number> = new Map();
  seatVotes: Map<Seat, Vote> = new Map();
  remaining: Set<string> = new Set();
  openings: number;

  constructor(
    votes: Map<string, string[]> | Record<string, string[]>,
    openings: number = 1
  ) {
    this.openings = openings;

    if (!(votes instanceof Map)) {
      votes = new Map<string, string[]>(Object.entries(votes));
    }

    for (const [key, value] of votes) {
      let vote = new Vote(key, value);
      this.seatVotes.set(key, vote);

      this.remaining = this.remaining.union(new Set(value));
      let tmp = this.candidateVotes.get(vote.first!) ?? [];
      tmp.push(vote);
      this.candidateVotes.set(vote.first!, tmp);
    }
    // console.log(this.candidateVotes);
    // console.log(this.remaining);
  }

  // Counts the number of current-preference votes for each candidate
  countVotes() {
    let result: Count[] = [];

    for (let [c, votes] of this.candidateVotes) {
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

  sort(i: Count, k: Count) {
    if (i.count < k.count) {
      return i;
    }
    if (k.count < i.count) {
      return k;
    }
    return this.tieBreaker(i, k);
  }

  tieBreaker(i: Count, k: Count) {
    console.log(i, k);
    // Perform count back - if no count back breaks the tie then rely on random
    // tie breaker. It's possible to simulate several elections if it's favourable
    // to award the win to the most probable candidate.

    // Select by random lot
    return getRandomInt(2) > 0 ? i : k;
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
