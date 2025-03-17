import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { logger } from "hono/logger";

import { app } from "./app";
import { VotingObject } from "./models";
import { addStub } from "./middleware/db";

import raceRoutes from "./routes/race";
import authRoutes from "./routes/auth";
import positionRoutes from "./routes/position";
import candidateRoutes from "./routes/candidate";

app.use(secureHeaders());
// app.use(cors()); // Need to reconfigure since this breaks web sockets
app.use(addStub);
app.use(logger());

app.route("/auth", authRoutes);
app.route("/position", positionRoutes);
app.route("/candidate", candidateRoutes);
app.route("/race", raceRoutes);

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    const users = await c.var.STUB.getAllUsers();
    const races = await c.var.STUB.getAllRaces();

    return {
      onMessage(event, ws) {
        console.log(JSON.stringify(users));

        ws.send(JSON.stringify(users));
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  })
);

export default app;

export { VotingObject };
