import { factory } from "@/shared/app";
import { getNominationsForPositionHandlers } from "@/nomination/handlers";

const app = factory.createApp();

app.get("/position/:id", ...getNominationsForPositionHandlers);

export default app;
