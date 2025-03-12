import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";

import { app } from "./app";
import { VotingObject } from "./models";

import positionRoutes from "./routes/position";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import { addStub } from "./middleware/db";
import { logger } from "hono/logger";

app.use(secureHeaders());
app.use(cors());
app.use(addStub);
app.use(logger());

app.route("/position", positionRoutes);
app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);

export default app;

export { VotingObject };
