"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AttendanceChartProps {
  data: { day: string; attendance: number }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <ChartContainer config={{ attendance: { label: "Attendance %", color: "var(--color-primary)" } }}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} fontSize={12} />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} fontSize={12} />
        <ChartTooltip cursor={{ fill: "var(--color-muted)" }} content={<ChartTooltipContent />} />
        <Bar dataKey="attendance" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
