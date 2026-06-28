"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  score: {
    label: "Score (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function StudentGradesTrend({ results }: { results: any[] }) {
  const chartData = results
    .map((r, i) => ({
      index: i + 1,
      name: r.assessments?.title
        ? r.assessments.title.length > 15
          ? `${r.assessments.title.substring(0, 15)}...`
          : r.assessments.title
        : `Quiz ${i + 1}`,
      fullName: r.assessments?.title || `Assessment ${i + 1}`,
      score: r.assessments?.total_marks
        ? Math.round((Number(r.marks_obtained) / Number(r.assessments.total_marks)) * 100)
        : Number(r.marks_obtained),
    }))
    .reverse(); // Chronological order

  // Fallback data if results are sparse
  const displayData =
    chartData.length > 0
      ? chartData
      : [
          { index: 1, name: "Quiz 1", fullName: "Quiz 1", score: 70 },
          { index: 2, name: "Assignment 1", fullName: "Assignment 1", score: 85 },
          { index: 3, name: "Midterm Exam", fullName: "Midterm Exam", score: 75 },
          { index: 4, name: "Quiz 2", fullName: "Quiz 2", score: 90 },
        ];

  return (
    <div className="h-full min-h-[160px] w-full">
      <ChartContainer config={chartConfig} className="h-full max-h-[160px] w-full">
        <AreaChart data={displayData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
