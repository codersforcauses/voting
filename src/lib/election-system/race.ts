import { Vote } from ".";

type Candidate = string;
type Seat = string;
type Count = {
  candidate: Candidate;
  count: number;
};
type TransferValue = {
  candidate: Candidate;
  tv: number;
};

export default class Race {
  candidateVotes: Map<Candidate, Vote[]> = new Map();
  seatVotes: Map<Seat, Vote> = new Map();
  openings: number;

  constructor(votes: Map<string, string[]>, openings: number = 1) {
    this.openings = openings;

    for (const [key, value] of votes) {
      let vote = new Vote(key, value);
      this.seatVotes.set(key, vote);

      let tmp = this.candidateVotes.get(vote.first!);

      if (tmp) {
        tmp.push(vote);
      } else {
        tmp = [vote];
      }

      this.candidateVotes.set(vote.first!, tmp);
    }
    console.log(this.candidateVotes);
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

  autocount() {
    if (this.openings > 1) {
      // Multi-candidate race - use hare-clark
      return this.hareClarke();
    }
    // Instant Run-off

    // First past the post
  }

  hareClarke() {
    let elected = [];
    const quota = Math.ceil(this.seatVotes.size / (this.openings + 1));

    console.log(quota);

    while (elected.length < this.openings) {
      let buffer = [];
      let count = this.countVotes();

      // Find candidates elected
      // TODO: Transfer value should only be on last allocated parcel
      for (const c of count) {
        if (c.count >= quota) {
          const transferValue = (c.count - quota) / c.count;
          buffer.push({
            candidate: c.candidate,
            tv: transferValue,
          });
          elected.push(c.candidate);
        }
      }

      // Enough Candidates elected - can early exit here
      if (elected.length >= this.openings) {
        break;
      }

      // Transfer votes
      if (buffer.length > 0) {
        // A candidate was elected so transfer their votes to the next candidate
        for (let c of buffer) {
          let candidate = c.candidate;
          let transferValue = c.tv;
          if (transferValue > 0) {
            for (let v of this.candidateVotes.get(candidate)!) {
              v.value *= transferValue;
              let next = v.next();
              if (next) {
                this.candidateVotes.get(next)?.push(v);
              }
            }
          }
          this.candidateVotes.delete(c.candidate);
        }
      } else {
        // TODO: Prematurely culling candidates. Need to re count after a distribution
        // and work out how to deal with tie breakers.
        // Transfer votes from lowest candidate
        // Find candidate with min votes
        const minCandidate = count.reduce((i, k) =>
          i.count < k.count ? i : k
        );

        console.log(minCandidate);
        // For each vote - pop candidate and append to second preference at current value
        for (let v of this.candidateVotes
          .get(minCandidate.candidate)!
          .values()) {
          let next = v.next();
          if (next) {
            this.candidateVotes.get(next)?.push(v);
          }
        }

        this.candidateVotes.delete(minCandidate.candidate);
        console.log(this.candidateVotes);
      }
    }
    return elected;
  }
}
