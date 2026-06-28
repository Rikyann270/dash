"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(var(--primary))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

export function StudentAttendancePie({ rate }: { rate: number }) {
  const data = [
    { name: "Present", value: rate, fill: "var(--color-present)" },
    { name: "Absent", value: 100 - rate, fill: "var(--color-absent)" },
  ];

  return (
    <Card className="flex flex-col border-none bg-transparent shadow-none">
      <CardContent className="flex-1 p-0 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[160px]">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} strokeWidth={5}>
              <Cell key="present" fill="hsl(var(--primary))" />
              <Cell key="absent" fill="rgba(var(--primary-foreground), 0.1)" />
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-bold text-2xl">
                          {rate}%
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[10px]">
                          Attendance
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
