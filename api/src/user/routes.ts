import { factory } from "@/shared/app";
import { requireAdmin } from "@/shared/middleware/auth";
import { getAllUsersHandlers, updateUserHandlers } from "@/user/handlers";

const app = factory.createApp();

app.get("/", requireAdmin, ...getAllUsersHandlers);

app.patch("/:user_id", requireAdmin, ...updateUserHandlers);

export default app;
