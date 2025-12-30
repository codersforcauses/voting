import { factory } from "@/shared/app";
import { requireAdmin } from "@/shared/middleware/auth";
import {
  recalculateRaceHandlers,
  getResultsByRaceHandlers,
  getAllResultsHandlers,
} from "@/results/handlers";

const app = factory.createApp();

app.post("/recalc/race/:id", requireAdmin, ...recalculateRaceHandlers);

app.get("/:id", ...getResultsByRaceHandlers);

app.get("/", ...getAllResultsHandlers);

export default app;
