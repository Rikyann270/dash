"use client";

import { Activity, AlertTriangle, ArrowRight, ArrowUpRight, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TrendData {
  date: string;
  attendanceRate: number;
  present: number;
  absent: number;
  late: number;
}

interface AtRiskStudent {
  id: string;
  name: string;
  program: string;
  attendanceRate: number;
  total: number;
  absent: number;
}

interface AttendanceCommandCenterProps {
  trends: TrendData[];
  atRiskStudents: AtRiskStudent[];
}

export function AttendanceCommandCenter({ trends, atRiskStudents }: AttendanceCommandCenterProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* Trends Chart */}
      <Card className="xl:col-span-7 h-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Attendance Trends (Last 14 Days)
          </CardTitle>
          <CardDescription>Overall daily attendance percentage</CardDescription>
        </CardHeader>
        <CardContent>
          {trends.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
              No recent attendance data available.
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ChartContainer config={{ attendanceRate: { label: "Attendance %", color: "var(--color-primary)" } }}>
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-attendanceRate)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-attendanceRate)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="var(--color-attendanceRate)"
                    fill="url(#fillAttendance)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* At-Risk Students Table */}
      <Card className="xl:col-span-5 h-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" /> Students At Risk
          </CardTitle>
          <CardDescription>Students below 85% attendance threshold</CardDescription>
          <CardAction>
            <Button aria-label="View all students" size="icon-sm" variant="outline">
              <ArrowUpRight />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <div className="overflow-auto max-h-[300px]">
            <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
              <TableHeader className="sticky top-0 bg-card z-10 border-b">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No students currently at risk. Excellent!
                    </TableCell>
                  </TableRow>
                ) : (
                  atRiskStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{student.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.absent} absences / {student.total} total
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-[10px]">
                          {student.program}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-bold ${student.attendanceRate < 70 ? "text-red-500" : "text-orange-500"}`}
                          >
                            {student.attendanceRate}%
                          </span>
                          <TrendingDown
                            className={`h-3 w-3 ${student.attendanceRate < 70 ? "text-red-500" : "text-orange-500"}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
