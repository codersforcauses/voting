import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { streamSSE } from "hono/streaming";

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

app.use(secureHeaders());
app.use(cors()); // Need to reconfigure since this breaks web sockets
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

app.get("/sse", async (c) => {
  c.header("Content-Encoding", "Identity");

  return streamSSE(
    c,
    async (stream) => {
      while (true) {
        const [currentRace] = await c.var.STUB.getCurrentRace();

        if (currentRace) {
          await stream.writeSSE({
            data: JSON.stringify({
              race_id: currentRace.race.id,
              status: currentRace.race.status,
              position_id: currentRace?.positions?.id,
              title: currentRace?.positions?.title,
            }),
          });
        }

        await stream.sleep(5000);
      }
    },
    async (err, stream) => {
      console.log(err, stream);
    }
  );
});

export default app;

export { VotingObject };
