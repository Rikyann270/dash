import { format } from "date-fns";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

import { AttendanceCommandCenter } from "./_components/attendance-command-center";
import { PrincipalKpiCards } from "./_components/principal-kpi-cards";
import { TeacherLessonsStatus } from "./_components/teacher-lessons-status";

export const dynamic = "force-dynamic";

export default async function SchoolDashboardOverview() {
  const formattedDate = format(new Date(), "EEEE, do MMMM yyyy");
  const supabase = await createClient();

  // 1. Gather all statistics concurrently
  const [{ count: studentsCount }, { count: teachersCount }, { data: coverage }, { data: attendanceData }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("teachers").select("*", { count: "exact", head: true }),
      supabase
        .from("lesson_sessions")
        .select(
          "*, teachers:actual_teacher_id(profiles(first_name, last_name)), timetable_sessions(start_time, end_time, classes(name), subjects(name))",
        )
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("attendance")
        .select("status, student_id, students(program_type, profiles(first_name, last_name)), lesson_sessions(date)")
        .limit(1000),
    ]);

  // Derive metrics
  const totalStudents = studentsCount || 0;
  const totalTeachers = teachersCount || 0;

  const presentCount = attendanceData?.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length || 0;
  const totalAttendanceRecords = attendanceData?.length || 1;
  const avgAttendance = ((presentCount / totalAttendanceRecords) * 100).toFixed(1);

  // Lesson statuses based on coverage feed
  const lessonsToday = coverage || [];
  const submittedLessons = lessonsToday.filter((l) => l.status === "SUBMITTED").length;
  const missedLessons = lessonsToday.filter((l) => l.status === "SKIPPED" || l.status === "SCHEDULED").length;

  // --- Process Flagship Attendance Data ---

  // 1. Calculate Attendance Trends (Group by Date)
  const trendsMap: Record<string, { present: number; absent: number; late: number }> = {};

  attendanceData?.forEach((record: any) => {
    if (!record.lesson_sessions?.date) return;
    const date = record.lesson_sessions.date;
    if (!trendsMap[date]) trendsMap[date] = { present: 0, absent: 0, late: 0 };

    if (record.status === "PRESENT") trendsMap[date].present++;
    if (record.status === "ABSENT") trendsMap[date].absent++;
    if (record.status === "LATE") trendsMap[date].late++;
  });

  const attendanceTrends = Object.entries(trendsMap)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, counts]) => {
      const total = counts.present + counts.absent + counts.late;
      return {
        date,
        attendanceRate: total > 0 ? Math.round(((counts.present + counts.late) / total) * 100) : 0,
        ...counts,
      };
    })
    .slice(-14); // Last 14 active days

  // 2. Identify At-Risk Students (Group by Student)
  const studentMap: Record<string, any> = {};

  attendanceData?.forEach((record: any) => {
    const sId = record.student_id;
    if (!sId) return;
    if (!studentMap[sId]) {
      studentMap[sId] = {
        id: sId,
        name: `${record.students?.profiles?.first_name || "Unknown"} ${record.students?.profiles?.last_name || ""}`.trim(),
        program: record.students?.program_type || "N/A",
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
    }

    studentMap[sId].total++;
    if (record.status === "PRESENT") studentMap[sId].present++;
    if (record.status === "ABSENT") studentMap[sId].absent++;
    if (record.status === "LATE") studentMap[sId].late++;
  });

  const atRiskStudents = Object.values(studentMap)
    .map((student) => ({
      ...student,
      attendanceRate: Math.round(((student.present + student.late) / student.total) * 100),
    }))
    .filter((student) => student.attendanceRate < 85 && student.total > 2) // At least a few sessions to be statistically significant
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 10); // Top 10 most at risk

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl leading-none tracking-tight">Principal Overview</h1>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap items-end justify-end gap-2 lg:w-fit">
          <Select defaultValue="today">
            <SelectTrigger className="w-34" id="school-period" size="sm">
              <SelectValue placeholder="Today" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" />

          <Button size="icon-sm" variant="outline">
            <Settings2 />
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <PrincipalKpiCards
        students={totalStudents}
        teachers={totalTeachers}
        attendance={avgAttendance}
        submittedLessons={submittedLessons}
        missedLessons={missedLessons}
      />

      {/* Flagship Attendance Command Center */}
      <div className="w-full">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">Attendance Command Center</h2>
        <AttendanceCommandCenter trends={attendanceTrends} atRiskStudents={atRiskStudents} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-12">
          <TeacherLessonsStatus lessons={lessonsToday} />
        </div>
      </div>
    </div>
  );
}
