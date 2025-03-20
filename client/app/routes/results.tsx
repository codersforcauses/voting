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

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Results - CFC Election" },
    { name: "description", content: "View the results of the election" },
  ];
}

export default function Results() {
  const { data: wsData, error } = useWS();
  const [currentRace, refetchCurrentRace] = useCurrentRace();
  // const candidates = useCandidates(currentRace?.positions.id);
  const [elected, refetchElected] = useResults(1);
// 
  React.useEffect(() => {
    refetchCurrentRace();
  }, [wsData?.race_id, wsData?.status]);
  React.useEffect(() => {
    if (wsData?.status === "finished") refetchElected();
  }, [wsData?.status]);

  // refetchCurrentRace();
  // refetchElected();
  console.log(elected);
  // console.log(currentRace)

  return (
    <main>
      {JSON.stringify(elected)}
      {/* <ResultGraph></ResultGraph> */}
    </main>
  );
}
