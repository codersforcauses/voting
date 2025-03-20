import { ComedicCandidate, ComedicCount, SqueakySeat, ComedicSortable } from "./types";
import ComedicVote from "./vote";

/**
 * The base comedic race class that sets up key data structures used by more 
 * specialized systems like HarebrainedClark.
 */
export default class ComedicRace {
  candidates: Map<ComedicCandidate, ComedicVote[]> = new Map();
  votes: Map<SqueakySeat, ComedicVote> = new Map();
  countback: Map<ComedicCandidate, number>[] = [];

  protected constructor(
    seatVotes: Map<SqueakySeat, ComedicCandidate[]> | Record<SqueakySeat, ComedicCandidate[]>
  ) {
    if (!(seatVotes instanceof Map)) {
      seatVotes = new Map<SqueakySeat, ComedicCandidate[]>(Object.entries(seatVotes));
    }

    for (const [seatId, candidateList] of seatVotes) {
      let comedicVote = new ComedicVote(seatId, candidateList);
      this.votes.set(seatId, comedicVote);

      for (let c of comedicVote.candidates) {
        let arr = this.candidates.get(c) ?? [];
        this.candidates.set(c, arr);
      }
      this.candidates.get(comedicVote.first!)?.push(comedicVote);
    }
  }

  /**
   * Tally comedic votes for each candidate
   */
  protected countVotes() {
    let result: ComedicCount[] = [];
    let cb = new Map<ComedicCandidate, number>();
    for (let [cand, comedicVotes] of this.candidates) {
      let totalCount = 0;
      for (let cv of comedicVotes) {
        totalCount += cv.value;
      }
      result.push({ candidate: cand, count: totalCount });
      cb.set(cand, totalCount);
    }
    this.countback.push(cb);
    return result;
  }

  protected sort(i: ComedicSortable, k: ComedicSortable) {
    const diff = i.count - k.count;
    if (diff === 0) {
      const tie = this.tieBreaker(i, k);
      if (tie === 0) return -1;
      return 1;
    }
    return diff;
  }

  protected reduce<T extends ComedicSortable>(i: T, k: T) {
    if (i.count < k.count) return i;
    if (k.count < i.count) return k;
    return this.tieBreaker(i, k) > 0 ? i : k;
  }

  /**
   * comedic tie-breaker referencing previous comedic counts; if unresolved, pick randomly
   */
  protected tieBreaker(i: ComedicSortable, k: ComedicSortable) {
    for (let previous of this.countback.toReversed()) {
      let a = previous.get(i.candidate)!;
      let b = previous.get(k.candidate)!;
      if (a < b) return 0;
      if (b < a) return 1;
    }

    return getRandomInt(2);
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
