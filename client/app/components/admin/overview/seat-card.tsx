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
import { useQuery } from "@tanstack/react-query";

const SeatGenerator = () => {
  const { data, refetch } = useQuery({
    enabled: false,
    queryKey: ["seat"],
    queryFn: () =>
      fetch("http://localhost:8787/admin/seed").then((res) => res.json()),
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
        <Button variant="secondary" className="w-full" onClick={generate}>
          Generate New Seat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SeatGenerator;
