import { factory } from "@/shared/app";
import { requireAdmin } from "@/shared/middleware/auth";
import {
  getVoteCountHandlers,
  getWinningVotesHandlers,
  getVotesByRaceHandlers,
  createVoteHandlers,
} from "@/vote/handlers";

const app = factory.createApp();

app.get("/count/:id", ...getVoteCountHandlers);

app.get("/winningvotes/:id", requireAdmin, ...getWinningVotesHandlers);

app.get("/:race_id", requireAdmin, ...getVotesByRaceHandlers);

app.post("/:race_id", ...createVoteHandlers);

export default app;
