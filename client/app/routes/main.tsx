import * as React from "react";
import { StatusBar } from "@/components/status-bar/status-bar";
import type { Route } from "./+types/main";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Auth from "@/components/auth";
import { useUser, type User } from "@/lib/user";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CFC Democracy Enforcer" },
    { name: "description", content: "Democracy will prevail" },
  ];
}

const candidateData = [
  {
    name: "Candidate 1",
    whyJoin: "I want to do good",
  },
  {
    name: "Candidate 2",
    whyJoin: "I want to do bad",
  },
];

export default function Main() {
  const [user, setUser] = React.useState<User>(useUser());

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <h1 className="m-2 text-2xl">Nominated Candidates</h1>
      <Carousel className="mt-4">
        <CarouselContent>
          {candidateData.map((data, index) => (
            <CarouselItem key={index}>
              <Card className="m-2">
                <CardContent className="flex flex-col p-6">
                  <div className="text-xl font-semibold">{data.name}</div>
                  <div>Why do you want to join?</div>
                  <div>{data.whyJoin}</div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <StatusBar />
    </main>
  );
}
