"use client";

import { ArrowUpRight, BadgeCheck, CalendarDays, Clock, Flame, type LucideIcon, Minus, XCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn, getInitials } from "@/lib/utils";

import { tagTones } from "./data";
import type { ColumnId, Task, TaskInsightLabel, TaskPriority } from "./types";

const taskInsightIcons: Record<TaskInsightLabel, LucideIcon> = {
  Present: BadgeCheck,
  Absent: XCircle,
  Late: Clock,
};

const insightColorClass: Record<TaskInsightLabel, string> = {
  Present: "text-green-600 dark:text-green-400",
  Absent: "text-red-500 dark:text-red-400",
  Late: "text-yellow-600 dark:text-yellow-400",
};

const priorityBadgeConfig: Record<
  TaskPriority,
  { icon: LucideIcon; variant: "destructive" | "secondary"; className: string }
> = {
  High: {
    icon: Flame,
    variant: "destructive",
    className: "border-transparent",
  },
  Low: {
    icon: Minus,
    variant: "secondary",
    className: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  },
  Medium: {
    icon: ArrowUpRight,
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

export function TaskCard({
  task,
  columnId,
  isOverlay = false,
}: {
  task: Task;
  columnId?: ColumnId;
  isOverlay?: boolean;
}) {
  const isDone = columnId === "SUBMITTED";
  const showDetails = (columnId === "IN_PROGRESS" || columnId === "SUBMITTED") && typeof task.progress === "number";
  const owner = task.owner;
  const PriorityIcon = priorityBadgeConfig[task.priority].icon;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs",
        isOverlay && "w-68 rotate-1 shadow-lg",
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate font-semibold text-sm leading-none">{task.title}</h3>
          <Badge
            variant={priorityBadgeConfig[task.priority].variant}
            className={cn(
              "shrink-0 rounded-md border-transparent px-2 font-medium",
              priorityBadgeConfig[task.priority].className,
            )}
          >
            <PriorityIcon data-icon="inline-start" />
            {task.priority === "High" ? "Urgent" : task.priority}
          </Badge>
        </div>
        <p className="line-clamp-2 text-muted-foreground text-sm leading-5">{task.description}</p>
      </div>

      {!showDetails ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
              <AvatarFallback className="rounded-sm text-[10px]">{getInitials(owner.name)}</AvatarFallback>
            </Avatar>

            <span className="text-muted-foreground text-sm">{owner.name}</span>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <span className="truncate text-sm">{task.dueDate}</span>
            <CalendarDays className="size-3" />
          </div>
        </div>
      ) : null}

      {showDetails ? (
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="leading-none">Attendance Rate</span>
              <span className="tabular-nums leading-none">{task.progress}%</span>
            </div>
            <Progress value={task.progress} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">Teacher</span>
              <div className="flex items-center gap-1.5">
                <span className="truncate text-muted-foreground text-sm">{owner.name}</span>
                <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
                  <AvatarFallback className="rounded-sm text-[10px]">{getInitials(owner.name)}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">Time</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="truncate text-sm">{task.dueDate}</span>
                <CalendarDays className="size-3" />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">Class</span>
              <Badge
                variant="secondary"
                className={cn("rounded-md border-transparent px-2 font-medium", tagTones.blue)}
              >
                {task.team}
              </Badge>
            </div>
          </div>
        </div>
      ) : null}

      <Separator />

      <div>
        {isDone ? (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            {task.insights.map((insight) => {
              const Icon = taskInsightIcons[insight.label];
              return (
                <span
                  key={insight.label}
                  className={cn("flex items-center gap-1.5 text-sm", insightColorClass[insight.label])}
                >
                  <Icon className="size-3.5" />
                  {insight.count} {insight.label}
                </span>
              );
            })}
          </div>
        ) : null}

        {!isDone ? (
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5 text-sm">
              <Badge variant="secondary" className="rounded-md">
                Class: {task.team}
              </Badge>
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
