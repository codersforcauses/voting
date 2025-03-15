import { factory } from "@/app";
import { env } from "hono/adapter";
import { verify } from "hono/jwt";

export const authenticate = factory.createMiddleware(async (c, next) => {
    const { AUTH_SECRET_KEY } = env<{ AUTH_SECRET_KEY: string }>(c);
    const token = c.req.header("Authorization")?.split("Bearer ")[1];
    if (!token) {
        return c.json({ error: "No token provided" }, 401);
    }
    try {
        const verfied = await verify(token, AUTH_SECRET_KEY);
        console.log(verfied)
    } catch (err) {
        return c.json({ error: "Invalid token" }, 401);
    }
    await next();
})

// export const requireRole = (role: string) => factory.createMiddleware(async (c, next) => {
//     if (c.env)
// })