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
import { Candidate, HareClark, Seat } from "./election-system";

export function autocount<C extends Candidate>(
  data: Record<Seat, C[]>,
  openings: number = 1): C[] {
  // Multi-candidate race - use hare-clark
  // Hare-clark is a super-set of instant-run-off, so if used with only 1 opening
  // it just acts like instant run off anyway.
  const race = new HareClark(data, openings);
  const count = race.count();
  
  return count?.map((i) => i.candidate as C);
}
