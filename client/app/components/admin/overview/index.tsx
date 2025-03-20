import { useQuery } from "@tanstack/react-query";
import SeatGeneratorCard from "./seat-card";
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
    <div className="grid h-full gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RaceCard />
      <SeatGeneratorCard />
      <NominationCard />
      {data && <PositionCard positions={data} />}
    </div>
  );
};

export default OverView;
