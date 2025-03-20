import * as React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

import { Line, LineChart, XAxis, ReferenceLine } from "recharts";
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
  const tally = useCandidates();

  console.log(tally);
  
  const candidates = tally[0] ?? [];
  const lines: any[] = [];
  let key = 0;
  
  const colors = [
    "#2E86AB", "#F18F01", "#A4036F", "#16DB93", "#AF6978",
    "#6A0572", "#F9C22E", "#8D99AE", "#D81159", "#218380", 
    "#E84855", "#4AABAF", "#4F6D7A", "#FFB400", "#3A506B"
  ];  
  
  for (let [c, _] of Object.entries(candidates)) {
    lines.push(<Line
      dataKey={c}
      type="linear"
      stroke={colors[key]}
      strokeWidth={2}
      dot={true}
      key={key++}
    />)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>President Race</CardTitle>
        <CardDescription>6 Candidates: 1 Position</CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={tally}
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
          {lines}
          <ReferenceLine y={30} stroke="red" strokeDasharray="5 5" label="Quota" />
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
  const { data: results } = useQuery<any[]>({
    queryKey: ["results", "all"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/results/2`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // return response.json();
      
      return [
        {'A': 50, 'E': 0, 'L': 0, 'F': 20, 'B': 10, 'H': 10, 
          'I': 0, 'J': 0, 'K': 0, 'C': 20, 'D': 0, 'G': 0},
        {'E': 2, 'F': 22, 'B': 12, 'H': 10, 'C': 20, 'D': 4},
        {'F': 22, 'B': 12, 'H': 10, 'C': 20, 'D': 4},
        {'F': 22, 'B': 14, 'H': 12, 'C': 20},
        {'F': 22, 'B': 24, 'C': 20},
        {'F': 22, 'B': 44}
      ];
    },
  });

  return React.useMemo(() => results || [], [results]);
};

export default ResultGraph;
