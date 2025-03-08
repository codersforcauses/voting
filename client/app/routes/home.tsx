import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CFC Democracy Enforcer" },
    { name: "description", content: "Democracy will prevail" },
  ];
}

export default function Home() {
  return <Welcome />;
}
