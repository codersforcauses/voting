import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

const SeatGenerator = () => {
  const token = useToken();
  const { data, refetch, isRefetching } = useQuery({
    enabled: false,
    queryKey: ["seat"],
    queryFn: () =>
      fetch(`${BASE_URL}/admin/seat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
  });

  const generate = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="tracking-light">Seat</CardTitle>
        <CardDescription>6 digit code for a voter to register</CardDescription>
      </CardHeader>
      <CardContent className="font-mono text-5xl font-bold tracking-tight inline-flex items-center justify-evenly gap-1 leading-none">
        {data ? <SlidingNumber value={data} /> : "nocode"}
      </CardContent>
      <CardFooter>
        <Button
          disabled={isRefetching}
          variant="secondary"
          className="w-full"
          onClick={generate}
        >
          Generate New Seat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SeatGenerator;
