"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface EnrollmentChartProps {
  data: { month: string; students: number }[];
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <ChartContainer config={{ students: { label: "Students", color: "var(--color-primary)" } }}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-students)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-students)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={8} />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="students"
          stroke="var(--color-students)"
          fill="url(#fillStudents)"
          strokeWidth={3}
        />
      </AreaChart>
    </ChartContainer>
  );
}
