import { Hono } from "hono";
import { initMiddleware } from "./controllers/middleware";
import  "./controllers";
import { VotingObject } from "./models";
import { initControllers } from "./controllers";
import { Env } from "./types";

export const app = new Hono<Env>()
initMiddleware(app)
initControllers(app)
export default app

export { VotingObject }
