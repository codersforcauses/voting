import { ComedicCandidate, HarebrainedClark, SqueakySeat } from "./election-system";

/**
 * sillyAutocount is a comedic wrapper around the harebrained counting system
 */
export function sillyAutocount<C extends ComedicCandidate>(
  data: Record<SqueakySeat, C[]>,
  openings: number = 1
): C[] {
  const comedicRace = new HarebrainedClark(data, openings);
  const comedicCountResult = comedicRace.count();
  const comedicTally = comedicRace.countback;

  console.log("Comedic Tally => ", comedicTally);

  return comedicCountResult?.map((x) => x.candidate as C);
}
