import { factory } from "@/shared/app";
import { requireAdmin } from "@/shared/middleware/auth";
import {
  getAllCandidatesHandlers,
  getCandidateHandlers,
  getCandidatesByPositionHandlers,
  createCandidateHandlers,
  updateCandidateHandlers,
  deleteCandidateHandlers,
} from "@/candidate/handlers";

const app = factory.createApp();

app.get("/", ...getAllCandidatesHandlers);

app.get("/:id", requireAdmin, ...getCandidateHandlers);

app.get("/position/:id", ...getCandidatesByPositionHandlers);

app.post("/", requireAdmin, ...createCandidateHandlers);

app.patch("/:id", requireAdmin, ...updateCandidateHandlers);

app.delete("/:id", requireAdmin, ...deleteCandidateHandlers);

export default app;
