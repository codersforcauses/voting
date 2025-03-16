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
import { Race } from "./election-system";

export function autocount(data: Map<string, string[]>, openings: number = 1) {
  const race = new Race(data, openings);
  return race.autocount();
}

export function test() {
  const data = new Map<string, string[]>([
    ["745983", ["A", "C", "F"]],
    ["382917", ["A", "D", "H", "L", "K"]],
    ["000111", ["A", "F", "E", "C"]],
    ["999888", ["A", "D", "B", "C", "H", "I", "F", "G", "L"]],
    ["123123", ["E", "A", "L"]],
    ["443523", ["F", "B", "H", "I", "J", "K", "C"]],
    ["789789", ["C", "B", "E", "F", "G", "H", "I", "L", "J", "K"]],
    ["321321", ["F", "B", "H", "I", "J", "K", "C"]],
    ["001234", ["C", "B", "E", "F", "G", "H"]],
    ["987654", ["L", "B", "J", "I", "H", "E", "D", "A"]],
    ["456456", ["B", "D", "C", "K", "I", "J"]],
  ]);

  /* 
  I can tie break by counting the total number of vote for each candidate
  down the preference order (stopping at whoever is left in the count first)
  */

  console.log(autocount(data, 2));
}

test();
