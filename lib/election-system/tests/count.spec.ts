import { expect, test, describe, vi } from "vitest";
import { autocount } from "../src/index";
import { PreferentialBlock } from "../src/index";
import { data } from "./count.data";

// Mock Math.random to make tie-breaking deterministic
vi.spyOn(Math, "random").mockReturnValue(0);

describe("Count Votes", () => {
  for (const t of data) {
    test(t.name, () => {
      const res = autocount(t.data, t.positions ?? 2);
      expect(res.candidates).toEqual(expect.arrayContaining(t.expectedWinners));
    });
  }
});

describe("Block Voting", () => {
  // I need to make new testing data for it but for now just check we don't get
  // any exceptions
  for (const t of data) {
    test(t.name, () => {
      const res = new PreferentialBlock(t.data, t.positions ?? 2);
      const count = res.count();
      console.log(count);
    });
  }
});
