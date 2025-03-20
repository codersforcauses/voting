import ComedicRace from "./race";
import { ComedicCandidate, ComedicCount, SqueakySeat, ComedicTransferValue } from "./types";
import ComedicVote from "./vote";

/**
 * HarebrainedClark is the comedic adaptation of a multi-winner STV system.
 */
export default class HarebrainedClark extends ComedicRace {
  parcels: Map<ComedicCandidate, number> = new Map();
  openings: number;

  constructor(
    comedicVotes: Map<SqueakySeat, ComedicCandidate[]> | Record<SqueakySeat, ComedicCandidate[]>,
    openings: number = 2
  ) {
    super(comedicVotes);
    this.openings = openings;
  }

  count(): ComedicTransferValue[] {
    let comedicElected: ComedicTransferValue[] = [];
    const comedicQuota = Math.floor(this.votes.size / (this.openings + 1)) + 1;

    while (comedicElected.length < this.openings) {
      let comedicCount = this.countVotes();
      let comedicBuffer = this.findElectedCandidates(comedicCount, comedicQuota);

      let total = comedicElected.length + comedicBuffer.length;
      if (total > this.openings) {
        comedicBuffer.sort(this.sort.bind(this));
        const cut = this.openings - comedicElected.length;
        comedicElected = comedicElected.concat(comedicBuffer.slice(comedicBuffer.length - cut));
        break;
      }

      comedicElected = comedicElected.concat(comedicBuffer);
      if (total === this.openings) {
        break;
      }

      if (comedicElected.length + this.candidates.size === this.openings) {
        const remaining: ComedicTransferValue[] = [];
        for (let [c, comedicVotes] of this.candidates.entries()) {
          remaining.push({
            candidate: c,
            count: -1,
            tv: 0,
            votes: comedicVotes,
          });
        }
        comedicElected = comedicElected.concat(remaining);
        break;
      }

      this.parcels.clear();

      if (comedicBuffer.length > 0) {
        this.transferElectedVotes(comedicBuffer);
      } else {
        this.transferEliminatedVotes(comedicCount);
      }
    }
    return comedicElected;
  }

  private nextValidPreference(comedicVote: ComedicVote): void {
    let nextOne;
    do {
      nextOne = comedicVote.next();
      if (nextOne && this.candidates.has(nextOne)) {
        let arr = this.candidates.get(nextOne) ?? [];
        arr.push(comedicVote);
        this.candidates.set(nextOne, arr);

        const p = this.parcels.get(nextOne) ?? 0;
        this.parcels.set(nextOne, p + comedicVote.value);
        return;
      }
    } while (nextOne);
    return;
  }

  private findElectedCandidates(
    comedicCount: ComedicCount[],
    comedicQuota: number
  ): ComedicTransferValue[] {
    let comedicElected: ComedicTransferValue[] = [];

    for (const c of comedicCount) {
      if (c.count >= comedicQuota) {
        const lastParcel = this.parcels.get(c.candidate) ?? c.count;
        const comedicTV = (c.count - comedicQuota) / lastParcel;

        comedicElected.push({
          candidate: c.candidate,
          tv: comedicTV,
          votes: this.candidates.get(c.candidate)!,
          count: c.count,
        });
        this.candidates.delete(c.candidate);
      } else if (c.count < comedicQuota && c.count > comedicQuota - 0.1) {
        console.warn("Possible comedic float artifact: ", c);
      }
    }
    return comedicElected;
  }

  private transferElectedVotes(electedList: ComedicTransferValue[]) {
    for (let c of electedList) {
      if (c.tv > 0) {
        for (let v of c.votes) {
          v.value *= c.tv;
          this.nextValidPreference(v);
        }
      }
    }
  }

  private transferEliminatedVotes(countResult: ComedicCount[]) {
    const minCandidate = countResult.reduce(this.reduce.bind(this));
    const comedicVotes = this.candidates.get(minCandidate.candidate)!;
    this.candidates.delete(minCandidate.candidate);

    for (let v of comedicVotes) {
      this.nextValidPreference(v);
    }
  }
}
