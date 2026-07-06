"use client";

import { CheckCircle2, Circle, Clock, MoreVertical, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TaskCard } from "./task-card";
import type { Column, Task } from "./types";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  // Determine icon based on column id
  const Icon =
    column.id === "SUBMITTED"
      ? CheckCircle2
      : column.id === "IN_PROGRESS"
        ? Clock
        : column.id === "MISSED"
          ? XCircle
          : Circle;

  const colorClass =
    column.id === "SUBMITTED"
      ? "text-green-500"
      : column.id === "IN_PROGRESS"
        ? "text-yellow-500"
        : column.id === "MISSED"
          ? "text-red-500"
          : "text-muted-foreground";

  return (
    <section className="flex min-h-0 flex-col rounded-t-xl border bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("size-4 shrink-0", colorClass)} />
            <h2 className="truncate font-semibold text-base leading-none">{column.title}</h2>
          </div>
          <p className="text-muted-foreground text-sm tabular-nums leading-none">
            {tasks.length} {tasks.length === 1 ? "session" : "sessions"}
          </p>
        </div>
        <div className="-mr-2 flex items-center gap-0.5 text-muted-foreground">
          <Button variant="ghost" size="icon-sm" aria-label={`${column.title} column actions`}>
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnId={column.id} />
        ))}
      </div>
    </section>
  );
}
