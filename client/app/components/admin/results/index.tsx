import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ResultCard from "./card";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";
import type { ElectedCandidate } from "@/components/vote/queries";
import ResultGraph, { type Race } from "@/components/result-graph";

const Results = () => {
  const { hash } = useLocation();
  const token = useToken();
  const id = hash.split("?")[0]?.split("=")[1];

  const { data: electedData, isLoading: isLoadingElected } = useQuery<ElectedCandidate[]>({
    queryKey: ["results", id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/results/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const val = await response.json();
      return val;
    },
  });

  const { data: countData, isLoading: isVotesLoading } = useQuery({
    queryKey: ["votes", id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/vote/winningvotes/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const val = await response.json();
      return val;
    },
  });

  const { data: raceData, isLoading: isRaceLoading } = useQuery<Race[]>({
    queryKey: ["race", id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/race/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const val = await response.json();
      return val;
    },
  });

  if (isVotesLoading || isLoadingElected)
    return (
      <div className="grid h-full place-items-center">
        <span className="material-symbols-sharp animate-spin text-9xl!">
          progress_activity
        </span>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {electedData && countData && electedData.map(({ candidates: candidate }) => (
          <ResultCard key={candidate.name} candidate={candidate} stats={countData} />
        ))}
        {electedData?.length === 0 && (
          <div className="text-xl text-foreground m-5">No Results Found</div>
        )}
      </div>
      {/* { raceData && raceData?.length > 0 && raceData[0]?.tally && (
        <ResultGraph race={raceData[0]}></ResultGraph>
      )} */}
    </>
  );
};

export default Results;