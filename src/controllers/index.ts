import { Hono } from "hono"
import { Env } from "../types"
import initPosition from "./position"

export function initControllers(app: Hono<Env>) {
  initPosition(app)
}
