import { expect, test } from "@playwright/test";
import { autocount } from "@/lib/election-system";
import { data } from "./count.data";

test.describe("Count Votes", () => {
  test.describe.configure({ retries: 2 });

  for (let t of data) {
    test(t.name, async () => {
      let res = autocount(t.data, t.positions ?? 2);
      expect(res.candidates).toEqual(expect.arrayContaining(t.expectedWinners));
    });
  }
});
