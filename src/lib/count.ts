/*
Auto count works out which preferential voting algorithm to use based on the
characteristics of the race.

Vote map
seatID: [preference list]
{
	"010123": [A, C, B]
	"193343": [B, C, A]
	"845212": [C]
}

Count map
{
	A: [("010123", 1.0)]
	B: [("845212", 1.0), ("193343", 1.0)],
	C: [("328535", 1.0), ("345245", 1.0), ("123124", 1.0)]
}

count[A].length = first preference votes

## DB Schema

Votes:
id | user_id | race_id

Preferences:
vote_id | candidate_id | preference
*/
type Candidate = string;
type Seat = string;

type Vote = {
  seat: Seat;
  candidates: Candidate[];
  value: number;
};

class Race {
  candidate_votes: Map<Candidate, Vote[]> = new Map();
  seat_votes: Map<Seat, Vote> = new Map();
  openings: number;

  constructor(votes: Map<string, string[]>, openings: number = 1) {
    this.openings = openings;
    for (const [key, value] of votes) {
      let vote: Vote = {
        seat: key,
        candidates: value,
        value: 1.0,
      };

      this.seat_votes.set(key, vote);

      let tmp = this.candidate_votes.get(vote.candidates.at(-1)!);

      if (tmp) {
        tmp.push(vote);
      } else {
        tmp = [vote];
      }

      this.candidate_votes.set(vote.candidates.at(-1)!, tmp);
    }

    console.log(this.candidate_votes);
    // console.log(this.seat_votes)
  }

  countVotes() {
    let result: any[] = [];

    for (let [c, votes] of this.candidate_votes) {
      let count = 0;

      for (let v of votes) {
        count += v.value;
      }
      result.push([c, count]);
    }
    return result;
  }

  autocount() {
    if (this.openings > 1) {
      // Multi-candidate race - use hare-clark
      return this.hareClarke();
    }
    // Standard preferential voting

    // First past the post
  }

  hareClarke() {
    let elected = [];
    const quota = Math.ceil(this.seat_votes.size / (this.openings + 1) + 1);

    while (elected.length < this.openings) {
      let buffer = [];
      let count = this.countVotes();

      // Find candidates elected
      // Need to change vote count to actually count the value
      for (const c of count) {
        if (c[1] > quota) {
          const transfer_value = (quota - c[1]) / c[1];
          buffer.push([c[0], transfer_value]);
          elected.push(c[0]);
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
          let candidate = c[0];
          let transfer_value = c[1];

          for (let v of this.candidate_votes.get(candidate)!) {
            v.candidates.pop();
            v.value *= transfer_value;
            let next = v.candidates.at(-1);
            if (next) {
              this.candidate_votes.get(next)?.push(v);
            }
          }

          this.candidate_votes.delete(c[0]);
        }
      } else {
        // Transfer votes from lowest candidate
        // Find candidate with min votes
        const minCandidate = count.reduce((i, k) => (i[1] < k[1] ? i : k));

        console.log(minCandidate);
        // For each vote - pop candidate and append to second preference at current value
        for (let v of this.candidate_votes.get(minCandidate[0])!.values()) {
          v.candidates.pop();
          let next = v.candidates.at(-1);
          if (next) {
            this.candidate_votes.get(next)?.push(v);
          }
        }

        this.candidate_votes.delete(minCandidate[0]);
        console.log(this.candidate_votes);
      }
    }
    return elected;
  }
}

export function test() {
  const data = new Map<string, string[]>([
    ["745983", ["A", "C", "F"].reverse()],
    ["382917", ["A", "D", "H", "L", "K"].reverse()],
    ["000111", ["A", "F", "E", "C"].reverse()],
    ["999888", ["A", "D", "B", "C", "H", "I", "F", "G", "L"].reverse()],
    ["123123", ["E", "A", "L"].reverse()],
    ["456456", ["B", "D", "C", "K", "I", "J"].reverse()],
    ["789789", ["C", "B", "E", "F", "G", "H", "I", "L", "J", "K"].reverse()],
    ["001234", ["C", "B", "E", "F", "G", "H"].reverse()],
    ["987654", ["L", "B", "J", "I", "H", "E", "D", "A"].reverse()],
    ["321321", ["F", "B", "H", "I", "J", "K", "C"].reverse()],
    ["443523", ["F", "B", "H", "I", "J", "K", "C"].reverse()],
  ]);

  const race = new Race(data, 2);

  console.log(race.countVotes());
  console.log(race.autocount());
}

test();
