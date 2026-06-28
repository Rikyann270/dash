"use client";

import { ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

// Mock data similar to performance highlights to show attendance per program
const attendanceHighlights = [
  {
    program: "Vocational",
    start: 2,
    duration: 84, // attendance score
    avatars: ["ME", "TC"],
  },
  {
    program: "Technical",
    start: 2,
    duration: 92,
    avatars: ["PL"],
  },
  {
    program: "Business",
    start: 2,
    duration: 78,
    avatars: ["AC", "HR", "MKT"],
  },
  {
    program: "Arts",
    start: 2,
    duration: 88,
    avatars: ["DR", "PT"],
  },
];

const chartConfig = {
  duration: {
    label: "Attendance %",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type Highlight = (typeof attendanceHighlights)[number];

function AttendanceHighlightBar({
  height = 0,
  payload,
  width = 0,
  x = 0,
  y = 0,
}: {
  height?: number;
  payload?: Highlight;
  width?: number;
  x?: number;
  y?: number;
}) {
  if (!payload) {
    return null;
  }

  const barHeight = Math.min(32, height);
  const barY = y + (height - barHeight) / 2;
  const radius = barHeight / 2;
  const fillWidth = Math.max(width * (payload.duration / 100), 60);

  // Custom coloring based on attendance
  let fillColor = "var(--color-duration)";
  if (payload.duration < 80) fillColor = "var(--chart-5)"; // red/orange

  return (
    <g>
      <rect
        fill="color-mix(in oklch, var(--color-duration) 15%, transparent)"
        height={barHeight}
        rx={radius}
        width={width}
        x={x}
        y={barY}
      />
      <rect fill={fillColor} height={barHeight} rx={radius} width={fillWidth} x={x} y={barY} />

      <text
        dominantBaseline="middle"
        x={x + 12}
        y={barY + barHeight / 2 + 0.5}
        className="fill-primary-foreground font-medium text-xs"
      >
        {payload.program}
      </text>

      <text
        dominantBaseline="middle"
        fill="var(--foreground)"
        fontSize={11}
        textAnchor="end"
        x={x + width - 10}
        y={barY + barHeight / 2 + 0.5}
        className="font-medium tabular-nums"
      >
        {payload.duration}%
      </text>
    </g>
  );
}

export function StudentAttendanceChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Attendance Metrics</CardTitle>
        <CardAction className="flex items-center gap-1 text-muted-foreground text-xs">
          View Details <ArrowRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <BarChart
            accessibilityLayer
            data={attendanceHighlights}
            layout="vertical"
            margin={{ bottom: 0, left: 0, right: 8, top: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="4 4" />
            <XAxis
              axisLine={false}
              domain={[0, 100]}
              tickLine={false}
              tickMargin={10}
              ticks={[0, 25, 50, 75, 100]}
              type="number"
            />
            <YAxis axisLine={false} dataKey="program" tickLine={false} tickMargin={10} type="category" width={0} />
            <Bar dataKey="start" fill="transparent" stackId="timeline" />
            <Bar dataKey="duration" shape={<AttendanceHighlightBar />} stackId="timeline" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
