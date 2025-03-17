import { Candidate, Count, Seat } from "./types";
import Vote from "./vote";

export default class Race {
  candidateVotes: Map<Candidate, Vote[]> = new Map();
  candidateParcel: Map<Candidate, number> = new Map();
  seatVotes: Map<Seat, Vote> = new Map();
  remaining: Set<string> = new Set();
  openings: number;

  constructor(votes: Map<string, string[]>, openings: number = 1) {
    this.openings = openings;

    for (const [key, value] of votes) {
      let vote = new Vote(key, value);
      this.seatVotes.set(key, vote);

      this.remaining = this.remaining.union(new Set(value));
      let tmp = this.candidateVotes.get(vote.first!);

      if (tmp) {
        tmp.push(vote);
      } else {
        tmp = [vote];
      }

      this.candidateVotes.set(vote.first!, tmp);
    }
    console.log(this.candidateVotes);
    console.log(this.remaining);
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

  tieBreaker(i: Count, k: Count) {
    let count: Map<string, number> = new Map();

    for (let c of [i, k]) {
      let votes = this.candidateVotes.get(c.candidate)!;
      for (let v of this.candidateVotes.get(c.candidate)!) {
        // console.log(v);
        let next = v.nextEffectiveVote(
          this.remaining.difference(new Set([c.candidate]))
        );
        // console.log(next);
        if (next) {
          let tmp = count.get(next);
          if (tmp) {
            tmp += 1;
          } else {
            tmp = 1;
          }
          count.set(next, tmp);
        }
      }
    }
    // console.log(count);

    // throw Error("Exit");
    let iVal = count.get(i.candidate);
    let kVal = count.get(k.candidate);

    if (iVal) {
      if (kVal) {
        if (iVal < kVal) {
          return i;
        }
        return k;
      }
      return i;
    }
    return i;
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
