import { factory } from "@/shared/app";
import { requireAdmin } from "@/shared/middleware/auth";
import { loginHandlers, checkAdminHandlers } from "@/auth/handlers";

const app = factory.createApp();

app.post("/", ...loginHandlers);

app.get("/", requireAdmin, ...checkAdminHandlers);

export default app;
