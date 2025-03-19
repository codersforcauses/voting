import * as React from "react";
import type { Route } from "./+types/main";
import Auth from "@/components/auth";
import { useToken } from "@/lib/user";
import Vote from "@/components/vote";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CFC Democracy Enforcer" },
    { name: "description", content: "Democracy will prevail" },
  ];
}

export default function Main() {
  const [token, setToken] = React.useState(useToken());

  return (
    <>
      <header className="flex justify-end py-1 px-4">
        <nav>
          <Button className="text-muted-foreground" asChild variant="link" size="sm">
            <Link to="/results">View Results</Link>
          </Button>
        </nav>
      </header>
      
      {token ? <Vote /> : <Auth setToken={setToken} />}
    </>
  );
}
