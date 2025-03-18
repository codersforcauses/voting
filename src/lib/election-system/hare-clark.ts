import Race from "./race";
import { Candidate, Count, Seat, TransferValue } from "./types";
import Vote from "./vote";

export default class HareClark extends Race {
  parcels: Map<Candidate, number> = new Map();
  openings: number = 1;

  constructor(
    votes: Map<Seat, Candidate[]> | Record<Seat, Candidate[]>,
    openings: number = 2
  ) {
    super(votes);
    this.openings = openings;
  }

  count() {
    let elected: TransferValue[] = [];
    const quota = Math.floor(this.votes.size / (this.openings + 1)) + 1;
    // console.log("QUOTA: ", quota);

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
        return elected.concat(buffer.slice(buffer.length - cut));
      }

      elected = elected.concat(buffer);
      if (total == this.openings) {
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
      // console.log(this.candidates);
    }
    return elected;
  }

  nextValidPreference(v: Vote): Candidate | undefined {
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
        return next;
      }
    } while (next); // If next is undefined it means there's no more candidates
    return undefined; // Vote is discarded
  }

  findElectedCandidates(count: Count[], quota: number): TransferValue[] {
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

  transferElectedVotes(buffer: TransferValue[]) {
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

  transferEliminatedVotes(count: Count[]) {
    // Work out how to deal with tie breakers and transfer votes from lowest
    // candidate. Find candidate with min votes
    const minCandidate = count.reduce(this.reduce.bind(this));
    const candidateVotes = this.candidates.get(minCandidate.candidate)!;
    this.candidates.delete(minCandidate.candidate);

    for (let v of candidateVotes) {
      this.nextValidPreference(v);
    }
  }
}
