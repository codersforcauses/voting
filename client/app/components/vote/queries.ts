import * as React from "react";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToken } from "@/lib/user";
import type { Position } from "@/lib/types";

type WSData = {
  race_id: number;
  status: "open" | "closed" | "finished";
};

type RaceStatus = "closed" | "open" | "finished";

interface Race {
  race: {
    id: number;
    position_id: number;
    status: RaceStatus;
    current: boolean | null;
  };
  positions: Position;
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
  nominations: {
    positions: {
      id: number;
      title: string;
    };
  }[];
}

interface ElectedCandidate {
  elected: {
    candidate_id: number;
    race_id: number;
  };
  candidates: {
    id: number;
    isMember: boolean;
    name: string;
  };
}

export const useWS = () => {
  const [data, setData] = React.useState<WSData | null>(null);
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
    staleTime: 0,
  });

  return data;
};

export const useCurrentRace = () => {
  const token = useToken();

  const { data: race, refetch } = useQuery<Race>({
    queryKey: ["currentRace"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/race/current`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  });

  return [race, refetch] as const;
};

export const useRaces = () => {
  const token = useToken();

  const { data: racesData, refetch } = useQuery<Race[]>({
    queryKey: ["races"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/race`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.json();
    },
  });

  return [racesData, refetch] as const;
};

export const useCandidates = (position_id?: number | string) => {
  const token = useToken();

  // get by position id
  const { data: candidatesByPosition } = useQuery<BaseCandidate[]>({
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

export const useResults = (race_id?: number | string) => {
  const token = useToken();

  const { data: racesData, refetch } = useQuery<ElectedCandidate[]>({
    enabled: !!race_id,
    queryKey: ["results", race_id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/results/${race_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.json();
    },
  });

  return [racesData, refetch] as const;
};
