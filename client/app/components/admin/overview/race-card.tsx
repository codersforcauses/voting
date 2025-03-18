import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";

type STATUS = "closed" | "open" | "finished";

const RaceCard = () => {
  const token = useToken();

  const { data: racesData, refetch } = useQuery({
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

  const positions = racesData?.map(({ positions }) => ({
    id: positions.id,
    value: positions.title,
  }));

  const [currentPositionID, setCurrentPosition] = React.useState("");

  const currentRace = racesData?.find(
    ({ positions }) => positions.id === currentPositionID
  );

  const [raceStatus, setRaceStatus] = React.useState(
    currentRace?.race?.status ?? "closed"
  );

  const raceMutation = useMutation({
    mutationKey: ["race", currentRace?.race.id],
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number | string;
      status: STATUS;
      current: boolean;
    }) => {
      const res = await fetch(`${BASE_URL}/race/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });

  const onToggleValChange = (value: STATUS) => {
    if (value) {
      setRaceStatus(value);
      raceMutation.mutateAsync({
        status: value as STATUS,
        id: currentRace?.race.id,
        current: value !== "finished",
      });
      refetch();
    }
  };

  const onSelectionChange = (value: string) => {
    if (value) {
      setCurrentPosition(value);
      raceMutation.mutateAsync({
        id: racesData?.find(({ positions }) => positions.id === value).race.id,
        status: "closed",
        current: true,
      });
      refetch();
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Voting</CardTitle>
          <CardDescription>Manage voting at AGM</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground">
              <span className="material-symbols-sharp text-2xl!">info</span>
            </TooltipTrigger>
            <TooltipContent className="space-y-2">
              <p className="font-semibold">Icon information</p>
              <ul className="flex justify-center flex-col gap-2">
                <li className="flex items-center gap-1">
                  <span className="material-symbols-sharp text-base!">
                    lock
                  </span>
                  <span>
                    Voting is closed and shows current position's candidates
                  </span>
                </li>
                <li className="flex items-center gap-1">
                  <span className="material-symbols-sharp text-base!">
                    how_to_vote
                  </span>
                  <span>Voting has started for all</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className="material-symbols-sharp text-base!">
                    done_all
                  </span>
                  <span>
                    Voting for current position has completed and results will
                    be shown
                  </span>
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="h-full">hello</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={currentPositionID} onValueChange={onSelectionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {positions?.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            variant="outline"
            disabled={currentPositionID === ""}
            value={raceStatus}
            onValueChange={onToggleValChange}
            className="w-full sm:w-fit"
          >
            <ToggleGroupItem value="closed">
              <span className="material-symbols-sharp">lock</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="open">
              <span className="material-symbols-sharp">how_to_vote</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="finished">
              <span className="material-symbols-sharp">done_all</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceCard;
