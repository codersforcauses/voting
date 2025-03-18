import Race from "./race";
import { Candidate, Count, Seat, TransferValue } from "./types";
import Vote from "./vote";

export default class HareClark extends Race {
  count() {
    let elected: TransferValue[] = [];
    const quota = Math.ceil(this.seatVotes.size / (this.openings + 1));

    while (elected.length < this.openings) {
      let count = this.countVotes();
      let buffer = this.findElectedCandidates(count, quota);
      elected = elected.concat(buffer);

      // Enough Candidates elected - can early exit here
      if (elected.length >= this.openings) {
        break;
      }

      // Clear parcel
      this.candidateParcel.clear();

      // Transfer votes
      if (buffer.length > 0) {
        this.transferElectedVotes(buffer);
      } else {
        this.transferEliminatedVotes(count);
      }
      // console.log(this.candidateVotes);
    }
    return elected;
  }

  nextValidPreference(v: Vote): string | undefined {
    let next;
    do {
      next = v.next();
      if (next && this.remaining.has(next)) {
        let tmp = this.candidateVotes.get(next) ?? [];
        tmp.push(v);
        this.candidateVotes.set(next, tmp);

        // Update the latest parcel
        const p = this.candidateParcel.get(next) ?? 0;
        this.candidateParcel.set(next, p + v.value);
        return next;
      }
    } while (next); // If next is undefined it means there's no more candidates
    return undefined; // Vote is discarded
  }

  findElectedCandidates(count: Count[], quota: number): TransferValue[] {
    let elected: TransferValue[] = [];

    // Find candidates elected
    // TODO: Transfer value should only be on last allocated parcel
    for (const candidate of count) {
      if (candidate.count >= quota) {
        const lastParcel =
          this.candidateParcel.get(candidate.candidate) ?? candidate.count;
        const transferValue = (candidate.count - quota) / lastParcel;

        elected.push({
          candidate: candidate.candidate,
          tv: transferValue,
        });
        this.remaining.delete(candidate.candidate);
      }
    }
    return elected;
  }

  transferElectedVotes(buffer: TransferValue[]) {
    // A candidate was elected so transfer their votes to the next candidate
    for (let c of buffer) {
      let candidate = c.candidate;
      let transferValue = c.tv;
      if (transferValue > 0) {
        for (let v of this.candidateVotes.get(candidate)!) {
          v.value *= transferValue;
          this.nextValidPreference(v);
        }
      }
      this.candidateVotes.delete(c.candidate);
    }
  }

  transferEliminatedVotes(count: Count[]) {
    // Work out how to deal with tie breakers and transfer votes from lowest candidate
    // Find candidate with min votes
    const minCandidate = count.reduce(this.sort.bind(this));
    // console.log(minCandidate);

    // There is probably a better way to do this - we just need to save the candidate/s
    // temporarily somewhere.
    this.remaining.delete(minCandidate.candidate);

    for (let v of this.candidateVotes.get(minCandidate.candidate)!.values()) {
      this.nextValidPreference(v);
    }

    this.candidateVotes.delete(minCandidate.candidate);
  }
}
