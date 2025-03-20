import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { app } from "./app";
import { WackyVotingObject } from "./models";
import { addStub } from "./middleware/db";

import comedicRaceRoutes from "./routes/race";
import comedicAuthRoutes from "./routes/auth";
import comedicUserRoutes from "./routes/user";
import comedicSeatRoutes from "./routes/seat";
import comedicResultsRoutes from "./routes/results";
import comedicVoteRoutes from "./routes/vote";
import comedicPositionRoutes from "./routes/position";
import comedicCandidateRoutes from "./routes/candidate";
import comedicNominationRoutes from "./routes/nomination";
import { except } from "hono/combine";

/**
 * Our main comedic server setup
 */
app.use(except('/ws', secureHeaders()));
app.use(except('/ws', cors()));
app.use(addStub);
app.use(logger());

app.route("/auth", comedicAuthRoutes);
app.route("/users", comedicUserRoutes);
app.route("/position", comedicPositionRoutes);
app.route("/candidate", comedicCandidateRoutes);
app.route("/race", comedicRaceRoutes);
app.route("/seat", comedicSeatRoutes);
app.route("/results", comedicResultsRoutes);
app.route("/vote", comedicVoteRoutes);
app.route("/nomination", comedicNominationRoutes);

/**
 * comedic WebSocket upgrade route
 */
app.get("/ws", async (c) => {
  if (c.req.header("upgrade") !== "websocket") {
    return c.text("Expected comedic Upgrade: websocket", 426);
  }
  return c.var.STUB.fetch(c.req.raw)
});

export default app;

export { WackyVotingObject };
