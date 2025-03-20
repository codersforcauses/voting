import * as React from "react";
import type { Route } from "./+types/main";
import Auth from "@/components/auth";
import { useToken } from "@/lib/user";
import Vote from "@/components/vote";
import { useQueryClient } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AGM 2025 - CFC" },
    {
      name: "description",
      content: "Election application for the CFC 2025 AGM",
    },
  ];
}

export default function Main() {
  const [token, setToken] = React.useState(useToken());
  const queryClient = useQueryClient();
  const logout = React.useCallback(() => {
    setToken("");
    window.localStorage.removeItem("token");
    queryClient.invalidateQueries();
  }, []);
  return token ? <Vote logout={logout} /> : <Auth setToken={setToken} />;
}
