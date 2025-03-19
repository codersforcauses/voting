import { Candidate, HareClark, Seat } from "./election-system";

export function autocount<C extends Candidate>(
  data: Record<Seat, C[]>,
  openings: number = 1): C[] {
  // Multi-candidate race - use hare-clark
  // Hare-clark is a super-set of instant-run-off, so if used with only 1 opening
  // it just acts like instant run off anyway.
  const race = new HareClark(data, openings);
  const count = race.count();
  const tally = race.countback;

  // console.log(tally);

  return count?.map((i) => i.candidate as C);
}
