import * as React from "react";
import { Status, StatusBar } from "@/components/status-bar/status-bar";
import type { Route } from "./+types/main";
import Auth from "@/components/auth";
import { useUser, type User } from "@/lib/user";
import { candidates } from "@/mocks/candidate";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CFC Democracy Enforcer" },
    { name: "description", content: "Democracy will prevail" },
  ];
}

export default function Main() {
  const [user, setUser] = React.useState<User>(useUser());

  if (!user?.canVote) {
    return <Auth setUser={setUser} />;
  }

  return (
    <main className="relative w-screen h-screen px-10 py-5">
      <h1 className="text-2xl">Nominated Candidates</h1>
      <Accordion type="multiple" className="pb-10">
        {candidates.map((data, index) => (
          <AccordionItem key={data.name} value={`item-${index}`}>
            <AccordionTrigger>
              <div className="text-xl font-semibold">{data.name}</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-zinc-400">Why do you want to join?</div>
              <div>{data.reasonForJoining}</div>
              <div className="mt-2 text-zinc-400">
                How would you benefit the club?
              </div>
              <div>{data.benefitToClub}</div>
              <div className="mt-2 text-zinc-400">
                Are there any initiatives or events you would like to run if you
                were elected?
              </div>
              <div>{data.initiativesOrEvents}</div>
              <div className="mt-2 text-zinc-400">
                Are you currently a part of any other club's committee?
              </div>
              <div>{data.currentCommittee}</div>
              <div className="mt-2 text-zinc-400">
                Have you previously been part of any other club's committee?
              </div>
              <div>{data.previousCommittee}</div>
              <div className="mt-2 text-zinc-400">Can you attend the AGM?</div>
              <div>{data.canAttendAGM}</div>
              <div className="mt-2 text-zinc-400">
                If no, what should be said on your behalf at the AGM?
              </div>
              <div>{data.messageForAGM}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <StatusBar
        status={Status.Open}
        position="President"
        candidates={candidates}
      />
    </main>
  );
}
