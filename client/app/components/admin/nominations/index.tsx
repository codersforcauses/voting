import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import NominationCard from "./card";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

interface Candidate {
  id: number;
  name: string;
  isMember: boolean;
  email: string;
  graduation: string;
  position_id: number;
  attend: boolean;
  club_benefit: string;
  initiative: string;
  join_reason: string;
  other_clubs: string;
  past_clubs: string;
  say_something: string;
  student_num: string | number;
}

const Nominations = () => {
  const { hash } = useLocation();
  const token = useToken();
  const id = hash.split("?")[0].split("=")[1];

  const { data, isLoading } = useQuery({
    queryKey: ["candidates", id],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/candidate/position/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const val = await response.json();
      return val;
    },
  });

  const candidates = data ?? [];

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
      {candidates?.map((data: Candidate) => (
        <NominationCard key={data.name} {...data} />
      ))}
    </div>
  );
};

export default Nominations;
