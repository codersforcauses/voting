import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";
import {
  useCurrentRace,
  usePositions,
  useRaces,
} from "@/components/vote/queries";
import { SlidingNumber } from "@/components/ui/sliding-number";

type STATUS = "closed" | "open" | "finished";

const RaceCard = () => {
  const token = useToken();

  const [races, refetchRaces] = useRaces();
  const positions = usePositions();
  const [mount, setMounted] = React.useState(false);
  const [completedRaces, setCompletedRaces] = React.useState<string[]>([]);
  const [currentPositionID, setCurrentPosition] = React.useState("");

  const currentRace = races?.find(
    ({ positions }) => positions.id === parseInt(currentPositionID)
  );

  const [raceStatus, setRaceStatus] = React.useState("closed");

  React.useEffect(() => {
    // using mount to prevent changing state after first render
    if (!mount && races && races.length > 0) {
      const getRaceValues = races?.map(({ race }) => race);
      const current = getRaceValues.find(({ current }) => current);
      setCurrentPosition((current?.position_id ?? "").toString());
      setCompletedRaces(
        getRaceValues
          .filter(({ status }) => status === "finished")
          .map(({ position_id }) => position_id.toString())
      );
      setRaceStatus(current?.status ?? "closed");
      setMounted(true);
    }
  }, [races, mount]);

  const { data: count } = useQuery({
    enabled: !!currentRace?.race.id,
    queryKey: ["count", currentRace?.race.id],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/vote/count/${currentRace?.race.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.json();
    },
    refetchInterval: 2000,
  });

  const raceMutation = useMutation({
    mutationKey: ["race", currentRace?.race.id],
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
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
    if (currentRace && value) {
      setRaceStatus(value);
      raceMutation.mutateAsync({
        status: value as STATUS,
        id: currentRace.race.id,
        current: value !== "finished",
      });
      if (value === "finished") {
        setCompletedRaces((prev) => [...prev, currentPositionID]);
      }
      refetchRaces();
    }
  };

  const onSelectionChange = (value: string) => {
    if (value) {
      const selectedRace = races?.find(
        ({ positions }) => positions.id === parseInt(value)
      );
      if (selectedRace) {
        setCurrentPosition(value);
        raceMutation.mutateAsync({
          id: selectedRace.race.id,
          status: selectedRace.race.status,
          current: true,
        });
        setRaceStatus(selectedRace.race.status);
        refetchRaces();
      }
    }
  };

  return (
    <Card>
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
              <ul className="flex flex-col justify-center gap-2">
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
      <CardContent className="flex flex-col gap-4">
        <div className="h-full">
          {count ? (
            <div>
              <div className="tracking-tight text-2xl font-semibold tabular-nums flex">
                <SlidingNumber value={count.votes.toString()} />/{count.users}
              </div>
              <div className="text-sm text-muted-foreground">
                Votes Submitted
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              Voting has not yet started and voters can see every candidate.
              Select a position below to start the voting process.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            disabled={raceStatus === "open"}
            value={currentPositionID}
            onValueChange={onSelectionChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {positions?.map((position) => (
                <SelectItem
                  key={position.id}
                  value={position.id.toString()}
                  className={
                    completedRaces.includes(position.id.toString())
                      ? "line-through decoration-2"
                      : undefined
                  }
                >
                  {position.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            variant="outline"
            disabled={!currentPositionID}
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
