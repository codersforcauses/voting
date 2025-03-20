import * as React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

import { TrendingUp } from "lucide-react";
import { Line, LineChart, XAxis } from "recharts";
import { BASE_URL } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useToken } from "@/lib/user";

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

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#FFF",
  },
  mobile: {
    label: "Mobile",
    // color: "#60a5fa",
  },
} satisfies ChartConfig;

const ResultGraph = () => {
  // const positions = usePositions();
  const candidates = useCandidates();

  console.log(candidates);

  const chartData = [
    {
      month: "jan",
      desktop: 10,
    },
    {
      month: "feb",
      desktop: 20,
    },
    {
      month: "mar",
      desktop: 25,
    },
    {
      month: "apr",
      desktop: 50,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Linear</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <Line
            dataKey="desktop"
            type="linear"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      {
      // <CardFooter className="flex-col items-start gap-2 text-sm">
      //   <div className="flex gap-2 font-medium leading-none">
      //     Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
      //   </div>
      //   <div className="leading-none text-muted-foreground">
      //     Showing total visitors for the last 6 months
      //   </div>
      // </CardFooter>
    }
    </Card>
  );
};

export const useCandidates = () => {
  const token = useToken();

  // get all candidates
  const { data: results } = useQuery<Candidate[]>({
    queryKey: ["results", "all"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/results/2`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  });

  return React.useMemo(() => results || [], [results]);
};

export default ResultGraph;
