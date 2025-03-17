import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { app } from "./app";
import { VotingObject } from "./models";
import { addStub } from "./middleware/db";

import authRoutes from "./routes/auth";
import positionRoutes from "./routes/position";
import candidateRoutes from "./routes/candidate";

app.use(secureHeaders());
app.use(cors());
app.use(addStub);
app.use(logger());

app.route("/auth", authRoutes);
app.route("/position", positionRoutes);
app.route("/candidate", candidateRoutes);

export default app;

export { VotingObject };
