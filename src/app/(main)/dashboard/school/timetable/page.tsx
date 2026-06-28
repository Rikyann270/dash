import { getClasses, getSubjects } from "@/app/actions/academic";
import { getTeachers } from "@/app/actions/teachers";
import { getTimetableSessions } from "@/app/actions/timetable";

import { TimetableClient } from "./_components/timetable-client";

export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  const [sessions, classes, subjects, teachers] = await Promise.all([
    getTimetableSessions(),
    getClasses(),
    getSubjects(),
    getTeachers(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">Master Timetable</h1>
        <p className="text-muted-foreground">Coordinate scheduled classes, rooms, and teacher loads.</p>
      </div>
      <TimetableClient
        initialSessions={sessions as any}
        classes={classes as any}
        subjects={subjects as any}
        teachers={teachers as any}
      />
    </div>
  );
}
