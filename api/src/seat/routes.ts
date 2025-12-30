import { factory } from "@/shared/app";
import {
  getSeatHandlers,
  getSeatByCodeHandlers,
  createSeatHandlers,
} from "@/seat/handlers";

const app = factory.createApp();

app.get("/:id", ...getSeatHandlers);

app.get("/code/:code", ...getSeatByCodeHandlers);

app.post("/", ...createSeatHandlers);

export default app;
