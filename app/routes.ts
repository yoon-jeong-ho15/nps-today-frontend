import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("date", "routes/date-list.tsx"),
  route("date/:date", "routes/date-detail.tsx"),
  route("company", "routes/company-list.tsx"),
  route("company/:id", "routes/company-detail.tsx"),
  route("trend", "routes/trend.tsx"),
] satisfies RouteConfig;
