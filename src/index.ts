import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { VotingObject } from "./models";
import { Env } from "./types";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";

const app = new Hono<Env>();

app.use(secureHeaders());
// app.use("*", cors());

app.route("/auth", authRouter);
app.route("/admin", adminRouter);

export default app;

export { VotingObject };
