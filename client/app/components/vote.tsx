import * as React from "react";
import { Status, StatusBar } from "@/components/status-bar/status-bar";
import { candidates } from "@/mocks/candidate";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WS_URL } from "@/lib/utils";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

const Vote = () => {
  const [val, setVal] = React.useState();
  const queryClient = useQueryClient(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
        },
      },
    })
  );
  React.useLayoutEffect(() => {
    const websocket = new WebSocket(`${WS_URL}/ws`);

    websocket.onopen = () => {
      console.log("connected");
    };

    websocket.onmessage = (event) => {
      setVal(JSON.parse(event.data));

      //   // TODO: fix query data when working
      //   queryClient.setQueriesData(data.entity, (oldData) => {
      //     const update = (entity) =>
      //       entity.id === data.id ? { ...entity, ...data.payload } : entity;

      //     return Array.isArray(oldData) ? oldData.map(update) : update(oldData);
      //   });
    };

    return () => {
      websocket.close();
    };
  }, [queryClient]);

  return (
    <main className="h-screen p-6 md:p-10">
      <h1 className="text-2xl">Nominated Candidates {val}</h1>
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
};

export default Vote;
