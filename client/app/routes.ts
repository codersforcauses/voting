import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/main.tsx"),
    route("admin", "routes/admin.tsx"),
    route("results", "routes/results.tsx")
] satisfies RouteConfig;
