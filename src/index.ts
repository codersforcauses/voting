import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { app } from "./app";
import { VotingObject } from "./models";
import { addStub } from "./middleware/db";

import raceRoutes from "./routes/race";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import seatRoutes from "./routes/seat";
import resultsRoutes from "./routes/results";
import voteRoutes from "./routes/vote";
import positionRoutes from "./routes/position";
import candidateRoutes from "./routes/candidate";
import nominationRoutes from "./routes/nomination";
import { except } from "hono/combine";

app.use(except('/ws', secureHeaders()));
app.use(except('/ws', cors()));
app.use(addStub);
app.use(logger());

app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/position", positionRoutes);
app.route("/candidate", candidateRoutes);
app.route("/race", raceRoutes);
app.route("/seat", seatRoutes);
app.route("/results", resultsRoutes);
app.route("/vote", voteRoutes);
app.route("/nomination", nominationRoutes);

app.get("/ws", async (c) => {
  if (c.req.header("upgrade") !== "websocket") {
    return c.text("Expected Upgrade: websocket", 426);
  }

  return c.var.STUB.fetch(c.req.raw)
});

export default app;

export { VotingObject };
