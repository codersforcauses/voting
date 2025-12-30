import { factory } from "@/shared/app";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

export const authenticate = factory.createMiddleware(async (c, next) => {
  const { AUTH_SECRET_KEY } = env<{ AUTH_SECRET_KEY: string }>(c);
  const token = c.req.header("Authorization")?.split("Bearer ")[1];

  if (token) {
    try {
      const verified = await verify(token, AUTH_SECRET_KEY);
      if (typeof verified.sub === 'string') c.set("ID", verified.sub);
      if (verified.role === 'user' || verified.role === 'admin') c.set("ROLE", verified.role);
    } catch (err) {
      throw new HTTPException(401, { message: "Invalid token" });
    }
  }
  await next();
});

export const requireUser = factory.createMiddleware(async (c, next) => {
  const role = c.get("ROLE");

  if (!role) {
    throw new HTTPException(403, { message: "Unauthorized" });
  }
  await next();
});

export const requireAdmin = factory.createMiddleware(async (c, next) => {
  const role = c.get("ROLE");

  if (role !== "admin") {
    throw new HTTPException(403, { message: "Unauthorized" });
  }
  await next();
});
