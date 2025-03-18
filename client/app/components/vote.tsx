import * as React from "react";
import { StatusBar } from "@/components/status-bar/status-bar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToken } from "@/lib/user";
import QUESTIONS from "@/lib/questions";

type Data = {
  position_id: number;
  race_id: number;
  status: "open" | "closed" | "finished";
  title: string;
};

const useSSE = () => {
  const [data, setData] = React.useState<Data | null>(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const es = new EventSource(`${BASE_URL}/sse`);

    es.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };
    es.onerror = (error) => {
      console.log(error);

      setError(error);
      es.close();
    };
    return () => {
      es.close();
    };
  }, []);

  return {
    data: React.useMemo(() => data, [data]),
    error,
  };
};

const Vote = () => {
  const { data, error } = useSSE();
  const token = useToken();
  const { data: positions } = useQuery({
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
  });
  const { data: candidatesByPosition } = useQuery({
    enabled: !!data?.position_id,
    queryKey: ["nominees", data?.position_id],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/candidate/position/${data?.position_id}`,
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
  const { data: candidatesList } = useQuery({
    enabled: !data,
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

  const candidates = candidatesByPosition || candidatesList || [];
  console.log(candidates);

  return (
    <main className="h-screen p-6 md:p-10">
      <h1 className="text-2xl">Nominated Candidates</h1>
      <Accordion type="multiple" className="pb-10">
        {candidates.map(({ name, id, ...data }) => (
          <AccordionItem key={name} value={id}>
            <AccordionTrigger>
              <div className="text-xl font-semibold">{name}</div>
            </AccordionTrigger>
            <AccordionContent className="gap-4 flex flex-col">
              {Object.entries(data).map(([key, value]) => {
                if (QUESTIONS.find((q) => q.id === key)) {
                  return (
                    <div key={key}>
                      <div className="text-muted-foreground">
                        {QUESTIONS.find((q) => q.id === key)?.question}
                      </div>
                      <div className="text-base">{value}</div>
                    </div>
                  );
                }
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {data && (
        <StatusBar
          status={data.status}
          position={data.title}
          candidates={candidates}
        />
      )}
    </main>
  );
};

export default Vote;
