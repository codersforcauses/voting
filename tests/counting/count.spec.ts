import { expect, test } from "@playwright/test";
import { autocount } from "@/lib/election-system";
import { PreferentialBlock } from "@/lib/election-system";
import { data } from "./count.data";
// 
// test.describe("Count Votes", () => {
//   test.describe.configure({ retries: 2 });
// 
//   for (let t of data) {
//     test(t.name, async () => {
//       let res = autocount(t.data, t.positions ?? 2);
//       expect(res.candidates).toEqual(expect.arrayContaining(t.expectedWinners));
//     });
//   }
// });


test.describe("Block Voting", () => {
  // I need to make new testing data for it but for now just check we don't get
  // any exceptions
  for (let t of data) {
    test(t.name, async () => {
      let res = new PreferentialBlock(t.data, t.positions ?? 2);
      let count = res.count();
      console.log(count);
    });
  }
});

