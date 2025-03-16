import nominationRouter from "./nominations";
import seatRoutes from "./seat";
import { factory } from "@/app";

const app = factory.createApp();

app.route("/nominations", nominationRouter);
app.route("/seat", seatRoutes);

app.get("/", (c) => c.json("admin"));

export default app;
