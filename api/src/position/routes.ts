import { factory } from "@/shared/app";
import { requireAdmin } from "@/shared/middleware/auth";
import {
  createPositionHandlers,
  getAllPositionsHandlers,
  updatePositionsHandlers,
} from "@/position/handlers";

const app = factory.createApp();

app.get("/", ...getAllPositionsHandlers);

app.post("/", requireAdmin, ...createPositionHandlers);

app.patch("/", requireAdmin, ...updatePositionsHandlers);

export default app;
