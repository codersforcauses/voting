import { factory } from "@/shared/app";
import { every } from "hono/combine";
import { authenticate, requireAdmin } from "@/shared/middleware/auth";
import {
  getAllRacesHandlers,
  getCurrentRaceHandlers,
  getRaceHandlers,
  updateRaceHandlers,
} from "@/race/handlers";

const app = factory.createApp();

app.get("/", every(authenticate, requireAdmin), ...getAllRacesHandlers);

app.get("/current", ...getCurrentRaceHandlers);

app.get("/:id", ...getRaceHandlers);

app.patch("/:id", requireAdmin, ...updateRaceHandlers);

export default app;
