import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CandidateTable from "./table";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

const NominationCard = () => {
  const token = useToken();
  const { data, refetch, isRefetching } = useQuery({
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

  const refetchCandidates = () => {
    refetch();
  };

  return (
    <Card className="md:col-span-2 max-w-[calc(100vw---spacing(4))] h-full lg:col-span-4 gap-4">
      <CardHeader>
        <CardTitle>Candidates</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        {data && (
          <CandidateTable
            candidates={data}
            refetch={refetchCandidates}
            isRefetching={isRefetching}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default NominationCard;
