import * as React from "react";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToken } from "@/lib/user";

type SSEData = {
  position_id: number;
  race_id: number;
  status: "open" | "closed" | "finished";
  title: string;
};

interface Position {
  id: number;
  title: string;
  description: string;
  priority: number;
  openings: number;
}

interface BaseCandidate {
  id: number;
  name: string;
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

interface Candidate extends BaseCandidate {
  positions: number[];
}
interface ReturnedCandidate extends BaseCandidate {
  nominations: {
    candidate_id: number;
    position_id: number;
  }[];
}

export const useSSE = () => {
  const [data, setData] = React.useState<SSEData | null>(null);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    const ws = new WebSocket(`${BASE_URL}/ws`);

    ws.onmessage = (event) => {
      setData((prev) => {
        if (!prev || JSON.stringify(prev) !== event.data)
          return JSON.parse(event.data);
        return prev;
      });
    };
    ws.onerror = (error) => {
      setError(error);
      ws.close();
    };
    return () => {
      ws.close();
    };
  }, []);

  const val = React.useMemo(
    () => ({
      data,
      error,
    }),
    [data, error]
  );

  return val;
};

export const usePositions = () => {
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
    staleTime: Infinity,
  });

  return data;
};

export const useCandidates = (position_id?: number | string) => {
  const token = useToken();

  // get by position id
  const { data: candidatesByPosition } = useQuery<Candidate[]>({
    enabled: !!position_id,
    queryKey: ["nominees", position_id],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/candidate/position/${position_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.json();
    },
  });

  // get all candidates
  const { data: candidatesList } = useQuery<Candidate[]>({
    enabled: !position_id,
    queryKey: ["nominees", "all"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/candidate`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  });

  const candidates = position_id ? candidatesByPosition : candidatesList;

  return React.useMemo(() => candidates || [], [candidates]);
};
