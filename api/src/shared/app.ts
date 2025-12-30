import { createFactory } from "hono/factory";
import { Env } from "./types";

export const factory = createFactory<Env>();
