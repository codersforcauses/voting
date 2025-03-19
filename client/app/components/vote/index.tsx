import * as React from "react";
import StatusBar from "./status-bar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QUESTIONS from "@/lib/questions";
import { useCandidates, usePositions, useSSE } from "./queries";

const Vote = () => {
  const { data, error } = useSSE();
  // const positions = usePositions();
  const candidates = useCandidates(data?.position_id);

  return (
    <main className="h-screen p-6 md:p-10">
      <h1 className="text-2xl">Nominated Candidates</h1>
      <Accordion type="multiple" className="pb-10">
        {candidates.map(({ name, id, ...data }) => (
          <AccordionItem key={name} value={id.toString()}>
            <AccordionTrigger>
              <div className="text-xl font-semibold">{name}</div>
            </AccordionTrigger>
            <AccordionContent className="gap-4 flex flex-col">
              {Object.entries(data)
                .filter(([key]) => QUESTIONS.find((q) => q.id === key))
                .map(([key, value]) => (
                  <div key={key}>
                    <div className="text-muted-foreground">
                      {QUESTIONS.find((q) => q.id === key)?.question}
                    </div>
                    <div className="text-base">{value}</div>
                  </div>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {data && candidates.length > 0 && (
        <StatusBar
          race_id={data?.race_id!}
          status={data?.status!}
          position={data?.title!}
          candidates={candidates}
        />
      )}
    </main>
  );
};

export default Vote;
