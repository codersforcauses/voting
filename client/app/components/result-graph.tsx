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
import type { Position } from "@/lib/types";

export type Race = {
  current: boolean;
  id: number;
  position_id: number;
  status: string;
  tally: string;
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

const ResultGraph = ({ race }: { race: Race }) => {  
  const tally = JSON.parse(race?.tally ?? "[]");
  console.log("Successful parse", tally);
  
  const candidates = tally.at(0) ?? {};
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
        <CardTitle>Result Data</CardTitle>
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
          {lines.length > 0 && <ReferenceLine y={30} stroke="red" strokeDasharray="5 5" label="Quota" />}
        </LineChart>
      </ChartContainer>
    </Card>
  );
};

export default ResultGraph;
