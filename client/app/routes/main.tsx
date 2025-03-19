import * as React from "react";
import type { Route } from "./+types/main";
import Auth from "@/components/auth";
import { useToken } from "@/lib/user";
import Vote from "@/components/vote";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AGM 2025 - CFC" },
    { name: "description", content: "Election application for the CFC 2025 AGM" },
  ];
}

export default function Main() {
  const [token, setToken] = React.useState(useToken());
  return token ? <Vote /> : <Auth setToken={setToken} />
}
