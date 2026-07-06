import { format } from "date-fns";

import { createClient } from "@/lib/supabase/server";

import { avatarTones } from "./_components/data";
import { Kanban } from "./_components/kanban";
import type { BoardState, ColumnId, Task, TaskInsight } from "./_components/types";

export const dynamic = "force-dynamic";

export default async function AttendanceCommandCenterPage() {
  const supabase = await createClient();
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const dateStr = format(today, "yyyy-MM-dd");

  // 1. Fetch today's timetable sessions along with class enrollment count
  const { data: timetableSessions } = await supabase
    .from("timetable_sessions")
    .select(`
      id,
      room,
      start_time,
      end_time,
      classes (
        name,
        class_enrollments (
          student_id
        )
      ),
      subjects (
        name
      ),
      teachers (
        profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("day_of_week", dayOfWeek);

  // 2. Fetch logged lesson sessions for today with attendance counts
  const { data: lessonSessions } = await supabase
    .from("lesson_sessions")
    .select(`
      id,
      timetable_session_id,
      status,
      summary,
      attendance (
        status
      )
    `)
    .eq("date", dateStr);

  const board: BoardState = {
    PENDING: [],
    IN_PROGRESS: [],
    SUBMITTED: [],
    MISSED: [],
  };

  const lessonSessionMap = new Map<string, any>();
  lessonSessions?.forEach((ls) => {
    lessonSessionMap.set(ls.timetable_session_id, ls);
  });

  timetableSessions?.forEach((ts: any, idx: number) => {
    const ls = lessonSessionMap.get(ts.id);

    // Determine Kanban Column Status
    let columnId: ColumnId = "PENDING";
    if (ls) {
      if (ls.status === "IN_PROGRESS") columnId = "IN_PROGRESS";
      else if (ls.status === "SUBMITTED") columnId = "SUBMITTED";
      else if (ls.status === "SKIPPED" || ls.status === "CANCELLED") columnId = "MISSED";
    }

    // Map priority based on column state (e.g. Urgent/High priority if missed)
    const priority = columnId === "MISSED" ? "High" : columnId === "IN_PROGRESS" ? "Medium" : "Low";

    // Map teacher profile
    const teacherName =
      `${ts.teachers?.profiles?.first_name || ""} ${ts.teachers?.profiles?.last_name || ""}`.trim() ||
      "Unassigned Teacher";
    const avatarTone = avatarTones[idx % avatarTones.length];

    // Compute progress & insights from attendance
    let progress = 0;
    const insights: TaskInsight[] = [
      { label: "Present", count: 0 },
      { label: "Absent", count: 0 },
      { label: "Late", count: 0 },
    ];

    const _enrollmentsCount = ts.classes?.class_enrollments?.length || 0;

    if (ls?.attendance) {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      ls.attendance.forEach((att: any) => {
        if (att.status === "PRESENT") presentCount++;
        else if (att.status === "ABSENT") absentCount++;
        else if (att.status === "LATE") lateCount++;
      });

      insights[0].count = presentCount;
      insights[1].count = absentCount;
      insights[2].count = lateCount;

      const totalResponded = presentCount + absentCount + lateCount;
      if (totalResponded > 0) {
        progress = Math.round(((presentCount + lateCount) / totalResponded) * 100);
      }
    }

    const timeSlot = `${ts.start_time?.substring(0, 5)} - ${ts.end_time?.substring(0, 5)}`;
    const roomInfo = ts.room ? `Room ${ts.room}` : "No Room Assigned";

    const task: Task = {
      id: ts.id,
      title: ts.subjects?.name || "General Session",
      description: ls?.summary || `Scheduled session in ${roomInfo}. Timely log expected.`,
      priority,
      dueDate: timeSlot,
      progress,
      owner: {
        name: teacherName,
        tone: avatarTone,
      },
      team: ts.classes?.name || "Class Group",
      insights,
    };

    board[columnId].push(task);
  });

  return (
    <div data-content-padding="false">
      <Kanban board={board} />
    </div>
  );
}
