import { format } from "date-fns";
import { ArrowRight, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TeacherLessonsStatus({ lessons }: { lessons: any[] }) {
  const today = format(new Date(), "EEEE, d MMMM");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Daily Teacher Logs</CardTitle>
        <CardAction className="flex items-center gap-1 text-muted-foreground text-xs">
          View Full Directory <ArrowRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        <div className="flex flex-col divide-y divide-border">
          {lessons.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No lessons scheduled or logged today.</div>
          ) : (
            lessons.map((lesson, idx) => {
              const isSubmitted = lesson.status === "SUBMITTED";
              const isPending = lesson.status === "SCHEDULED";
              const isMissed = lesson.status === "SKIPPED";

              const statusColorClass = isSubmitted
                ? "bg-green-600 dark:bg-green-400"
                : isMissed
                  ? "bg-destructive"
                  : "bg-yellow-500 dark:bg-yellow-400";
              const badgeVariant = isSubmitted ? "secondary" : isMissed ? "destructive" : "secondary";
              const badgeClass = isSubmitted
                ? "border-green-600/50 bg-green-50 text-green-600 dark:border-green-800/50 dark:bg-green-500/10 dark:text-green-400"
                : isMissed
                  ? "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/20"
                  : "border-yellow-600/50 bg-yellow-50 text-yellow-700 dark:border-yellow-800/50 dark:bg-yellow-500/10 dark:text-yellow-300";

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 bg-card py-3 transition-colors hover:bg-muted/30 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
                >
                  <div className="flex gap-2">
                    <div className={`w-1 shrink-0 rounded-md ${statusColorClass}`} />
                    <div className="text-nowrap text-xs flex items-center gap-2">
                      <Avatar className="size-6 bg-muted">
                        <AvatarFallback className="text-[10px]">
                          {lesson.teachers?.profiles?.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-foreground">
                        {lesson.teachers?.profiles?.first_name} {lesson.teachers?.profiles?.last_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="truncate font-medium text-foreground text-sm leading-none">
                      {lesson.timetable_sessions?.subjects?.name || "General Session"}
                    </div>
                    <div className="truncate text-muted-foreground text-xs leading-none">
                      {lesson.timetable_sessions?.classes?.name || "Class"} •{" "}
                      {lesson.timetable_sessions?.start_time?.substring(0, 5) || "00:00"}
                    </div>
                  </div>

                  <Badge
                    variant={badgeVariant as any}
                    className={`shrink-0 rounded-md px-2.5 py-1 font-medium text-[10px] ${badgeClass}`}
                  >
                    {isSubmitted ? "Submitted" : isMissed ? "Missed" : "Pending"}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
