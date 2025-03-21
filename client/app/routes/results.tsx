import * as React from "react";
import type { Route } from "./+types/results";
import ResultGraph from "../components/result-graph";
import {
  useCandidates,
  useCurrentRace,
  usePositions,
  useResults,
  useWS,
} from "@/components/vote/queries";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Results - CFC Election" },
    { name: "description", content: "View the results of the election" },
  ];
}

export default function Results() {
  const { data: wsData, error } = useWS();
  const [currentRace, refetchCurrentRace] = useCurrentRace();
  const candidates = useCandidates(currentRace?.positions.id);
  const [elected, refetchElected] = useResults(currentRace?.race.id);

  const { data: count } = useQuery({
    enabled: currentRace?.race.status === "open",
    queryKey: ["count", currentRace?.race.id],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/vote/count/${currentRace?.race.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.json();
    },
    refetchInterval: 1000,
  });

  React.useEffect(() => {
    refetchCurrentRace();
  }, [wsData?.race_id, wsData?.status]);
  React.useEffect(() => {
    if (wsData?.status === "finished") refetchElected();
  }, [wsData?.status]);

  return (
    <main className="flex flex-col gap-3 justify-center items-center h-screen">
      {currentRace?.race.status === "closed" && (
        <>
          <div className="text-2xl">Nominees</div>
          <div className="text-5xl mb-10">{currentRace?.positions.title}</div>
          <div className="grid w-full place-items-center grid-cols-[repeat(auto-fit,minmax(--spacing(50),1fr))] gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex justify-center items-center size-50 text-background bg-foreground text-4xl font-mono"
              >
                {candidate.name}
              </div>
            ))}
          </div>
        </>
      )}
      {currentRace?.race.status === "open" && (
        <>
          <div className="text-5xl  mb-10">{currentRace?.positions.title}</div>
          <div className="text-6xl text-foreground font-mono">
            Commence Voting
          </div>
          {count && (
            <div className="text-2xl">
              {count.votes.toString()}/{count.users}
            </div>
          )}
        </>
      )}

      {currentRace?.race.status === "finished" && (
        <>
          <div className="text-2xl">
            Winner{elected && elected.length > 1 && "s"}
          </div>
          <div className="text-5xl  mb-10">{currentRace?.positions.title}</div>
          <div className="flex gap-4">
            {elected &&
              elected.map((candidate) => (
                <div
                  key={candidate.candidates.id}
                  className="flex text-center justify-center items-center w-50 h-50 text-background bg-foreground text-4xl font-mono"
                >
                  {candidate.candidates.name}
                </div>
              ))}
          </div>
        </>
      )}

      {/* <ResultGraph></ResultGraph> */}
    </main>
  );
}
