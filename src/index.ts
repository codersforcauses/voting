import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { app } from "./app";
import { VotingObject } from "./models";
import { addStub } from "./middleware/db";

import positionRoutes from "./routes/position";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";

app.use(secureHeaders());
app.use(cors());
app.use(addStub);
app.use(logger());

app.route("/position", positionRoutes);
app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);

export default app;

export { VotingObject };
