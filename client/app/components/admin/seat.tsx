import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

const Seats = () => {
  const token = useToken();
  const [hasCopied, setHasCopied] = React.useState(false);
  const { data, refetch, isRefetching } = useQuery({
    enabled: false,
    queryKey: ["seat"],
    queryFn: () =>
      fetch(`${BASE_URL}/seat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
  });

  const generate = () => {
    setHasCopied(false);
    refetch();
  };

  const copy = () => {
    setHasCopied(true);
    navigator.clipboard.writeText(data);
  };

  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-sm w-full p-4 flex flex-col gap-6">
        <div className="font-mono text-5xl font-bold tracking-tight inline-flex items-center justify-evenly gap-1 leading-none">
          {data ? <SlidingNumber value={data} /> : "nocode"}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            disabled={isRefetching || !data}
            variant="outline"
            className="w-full"
            onClick={copy}
          >
            <span className="material-symbols-sharp text-base!">
              content_copy
            </span>
            {hasCopied ? "Copied" : "Copy to clipboard"}
          </Button>
          <Button disabled={isRefetching} className="w-full" onClick={generate}>
            <span className="material-symbols-sharp text-base!">
              person_add
            </span>
            Generate New Seat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Seats;
