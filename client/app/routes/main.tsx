import * as React from "react";
import type { Route } from "./+types/main";
import Auth from "@/components/auth";
import { useToken } from "@/lib/user";
import Vote from "@/components/vote";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CFC Democracy Enforcer" },
    { name: "description", content: "Democracy will prevail" },
  ];
}

export default function Main() {
  const [token, setToken] = React.useState(useToken());

  return token ? <Vote /> : <Auth setToken={setToken} />;
}
