import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ResultCard from "./card";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";
import type { ElectedCandidate } from "@/components/vote/queries";

const Results = () => {
  const { hash } = useLocation();
  const token = useToken();
  const id = hash.split("?")[0].split("=")[1];

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

  const { data: countData, isLoading } = useQuery({
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

  if (isLoading)
    return (
      <div className="grid h-full place-items-center">
        <span className="material-symbols-sharp animate-spin text-9xl!">
          progress_activity
        </span>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {electedData && electedData.map(({ candidates: candidate }) => (
        <ResultCard key={candidate.name} candidate={candidate} stats={countData} />
      )) || (
        <div className="text-xl">{ isLoadingElected ? 'Loading results...' : 'No Results Found'}</div>
      )}
    </div>
  );
};

export default Results;