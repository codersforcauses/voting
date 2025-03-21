import { useQuery } from "@tanstack/react-query";
import NominationCard from "./nomination/card";
import PositionCard from "./position-card";
import RaceCard from "./race-card";
import { useToken } from "@/lib/user";
import type { Position } from "@/lib/types";
import { BASE_URL } from "@/lib/utils";

const OverView = () => {
  const token = useToken();
  const { data } = useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/position`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
    staleTime: 0,
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <RaceCard />
      <NominationCard />
      {data && <PositionCard positions={data} />}
    </div>
  );
};

export default OverView;
