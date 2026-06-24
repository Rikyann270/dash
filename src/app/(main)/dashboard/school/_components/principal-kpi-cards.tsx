import { AlertTriangle, BookOpen, Info, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrincipalKpiCardsProps {
  students: number;
  teachers: number;
  attendance: string;
  submittedLessons: number;
  missedLessons: number;
}

export function PrincipalKpiCards({
  students,
  teachers,
  attendance,
  submittedLessons,
  missedLessons,
}: PrincipalKpiCardsProps) {
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Students</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-foreground leading-none tracking-tight">{students}</span>
              <Badge className="rounded-sm border-blue-600/50 bg-blue-500/10 px-1 font-normal text-blue-700 text-xs dark:border-blue-800/50 dark:bg-blue-500/15 dark:text-blue-300">
                <Users className="size-3 mr-1" /> Active
              </Badge>
            </div>
            <div className="text-right text-muted-foreground text-xs mt-1">across all programs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campus Attendance</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-foreground leading-none tracking-tight">{attendance}%</span>
            </div>
            <div className="text-right text-muted-foreground text-xs mt-1">average daily presence</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lessons Submitted</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-foreground leading-none tracking-tight">{submittedLessons}</span>
              <Badge className="rounded-sm border-green-600/50 bg-green-500/10 px-1 font-normal text-green-700 text-xs dark:border-green-800/50 dark:bg-green-500/15 dark:text-green-300">
                <BookOpen className="size-3 mr-1" /> Verified
              </Badge>
            </div>
            <div className="text-right text-muted-foreground text-xs mt-1">by faculty staff</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Action Required</CardTitle>
            <CardAction>
              <Info className="size-3 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-foreground leading-none tracking-tight">{missedLessons}</span>
              <Badge className="rounded-sm border-red-600/50 bg-red-500/10 px-1 font-normal text-red-700 text-xs dark:border-red-800/50 dark:bg-red-500/15 dark:text-red-300">
                <AlertTriangle className="size-3 mr-1" /> Pending
              </Badge>
            </div>
            <div className="text-right text-muted-foreground text-xs mt-1">lessons not submitted</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
