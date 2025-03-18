import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { streamSSE } from "hono/streaming";

import { app } from "./app";
import { VotingObject } from "./models";
import { addStub } from "./middleware/db";

import raceRoutes from "./routes/race";
import authRoutes from "./routes/auth";
import voteRoutes from "./routes/vote";
import positionRoutes from "./routes/position";
import candidateRoutes from "./routes/candidate";

app.use(secureHeaders());
app.use(cors()); // Need to reconfigure since this breaks web sockets
app.use(addStub);
app.use(logger());

app.route("/auth", authRoutes);
app.route("/position", positionRoutes);
app.route("/candidate", candidateRoutes);
app.route("/race", raceRoutes);

app.get("/sse", async (c) => {
  c.header("Content-Encoding", "Identity");
  // c.header("Content-Type", "text/event-stream");
  // c.header("Cache-Control", "no-cache");
  // c.header("Connection", "keep-alive");

  return streamSSE(
    c,
    async (stream) => {
      while (true) {
        const [currentRace] = await c.var.STUB.getCurrentRace();

        if (currentRace) {
          await stream.writeSSE({
            event: "race-update",
            id: currentRace.race.id.toString(),
            data: JSON.stringify({
              race_id: currentRace.race.id,
              status: currentRace.race.status,
              position_id: currentRace?.positions?.id,
              title: currentRace?.positions?.title,
            }),
          });
        }

        await stream.sleep(3000);
      }
    },
    async (err, stream) => {
      console.log(err, stream);
    }
  );
});

export default app;

export { VotingObject };
