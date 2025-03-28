import HareClark from "./hare-clark";
import Race from "./race";
import { Candidate, Seat } from "./types";
import Vote from "./vote";

export function autocount<C extends Candidate>(
  data: Record<Seat, C[]>,
  openings: number = 1): {candidates: C[], tally: Map<PropertyKey, number>[]} {
  // Multi-candidate race - use hare-clark
  // Hare-clark is a super-set of instant-run-off, so if used with only 1 opening
  // it just acts like instant run off anyway.
  const race = new HareClark(data, openings);
  const candidates = race.count().map((i) => i.candidate as C);
  const tally = race.countback;

  return {candidates, tally};
}


export { Vote, Race, HareClark, Seat, Candidate };
