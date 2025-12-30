import { logger } from "hono/logger";

import raceRoutes from "./race/routes";
import authRoutes from "./auth/routes";
import userRoutes from "./user/routes";
import seatRoutes from "./seat/routes";
import resultsRoutes from "./results/routes";
import voteRoutes from "./vote/routes";
import positionRoutes from "./position/routes";
import candidateRoutes from "./candidate/routes";
import nominationRoutes from "./nomination/routes";
import { authenticate } from "./shared/middleware/auth";
import { factory } from "./shared/app";

const app = factory.createApp()

app.use(logger());
// app.use(authenticate);

app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/position", positionRoutes);
app.route("/candidate", candidateRoutes);
app.route("/race", raceRoutes);
app.route("/seat", seatRoutes);
app.route("/results", resultsRoutes);
app.route("/vote", voteRoutes);
app.route("/nomination", nominationRoutes);

export default app;