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

  // console.log(racesData);
  // console.log(currentPositionID);

  // const {} = useMutation({
  //   mutationKey: ["race"],
  //   mutationFn: async () => {
  //     const res = await fetch(`${BASE_URL}/voting`, {
  //       method: "POST",
  //       body: JSON.stringify({ value }),
  //     });
  //     return res.json();
  //   },
  // });

  const onToggleValChange = (value: string) => {
    if (value) {
      setRaceStatus(value);
      refetch();
    }
  };

  const onSelectionChange = (value: string) => {
    if (value) {
      setCurrentPosition(value);
      refetch();
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Voting</CardTitle>
        <CardDescription>Manage voting at AGM</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
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
              <span className="material-symbols-sharp">close</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="not-started">
              <span className="material-symbols-sharp">resume</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="started">
              <span className="material-symbols-sharp">play_arrow</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="finished">
              <span className="material-symbols-sharp">check</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceCard;
