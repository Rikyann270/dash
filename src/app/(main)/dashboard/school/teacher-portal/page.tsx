import { Activity, BarChart as BarChartIcon, BookOpen, Calendar, Clock } from "lucide-react";

import { getTodayClasses } from "@/app/actions/teacher-portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { AttendanceChart } from "./_components/attendance-chart";
import { ClassSessionCard } from "./_components/class-session-card";

export const dynamic = "force-dynamic";

export default async function TeacherPortalPage() {
  const classes = await getTodayClasses();
  const supabase = await createClient();

  // Load metrics dynamically for the current teacher (demo grabs the first available teacher)
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, profiles(first_name, last_name)")
    .limit(1)
    .single();

  let stats = { classesCount: 0, topicsCount: 0, avgAttendance: "100%" };
  let teacherName = "Faculty Member";

  if (teacher) {
    const profile: any = Array.isArray(teacher.profiles) ? teacher.profiles[0] : teacher.profiles;
    teacherName = profile ? `${profile.first_name} ${profile.last_name}` : "Faculty Member";
    const [sessions, coverage, attendance] = await Promise.all([
      supabase.from("timetable_sessions").select("id").eq("teacher_id", teacher.id),
      supabase.from("lesson_sessions").select("id").eq("actual_teacher_id", teacher.id).in("status", ["SUBMITTED"]),
      supabase
        .from("attendance")
        .select("status, lesson_sessions!inner(id, actual_teacher_id)")
        .eq("lesson_sessions.actual_teacher_id", teacher.id),
    ]);

    const totalAtt = attendance.data?.length || 0;
    const presentAtt = attendance.data?.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length || 0;

    stats = {
      classesCount: sessions.data?.length || 0,
      topicsCount: coverage.data?.length || 0,
      avgAttendance: totalAtt > 0 ? `${((presentAtt / totalAtt) * 100).toFixed(0)}%` : "100%",
    };
  }

  // Mock data for weekly attendance chart
  const weeklyAttendanceData = [
    { day: "Mon", attendance: 95 },
    { day: "Tue", attendance: 88 },
    { day: "Wed", attendance: 92 },
    { day: "Thu", attendance: 85 },
    { day: "Fri", attendance: parseInt(stats.avgAttendance, 10) || 90 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-r from-violet-500/10 via-violet-500/5 to-transparent p-8">
        <div className="relative z-10 space-y-2">
          <h1 className="font-extrabold text-3xl tracking-tight">Teacher Portal</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{teacherName}</span>. Track student
            attendance, manage curriculum progression, and view your schedule.
          </p>
        </div>
        <div className="absolute top-0 right-0 -z-10 h-full w-1/3 bg-linear-to-l from-violet-500/20 to-transparent opacity-50 blur-3xl" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="group relative overflow-hidden transition-colors hover:border-violet-500/50">
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between font-semibold text-muted-foreground text-xs uppercase">
              Weekly Teaching Load
              <Calendar className="h-4 w-4 text-violet-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-3xl">{stats.classesCount}</div>
            <p className="mt-1 text-muted-foreground text-xs">assigned sections</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-colors hover:border-emerald-500/50">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between font-semibold text-muted-foreground text-xs uppercase">
              Average Attendance
              <BarChartIcon className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-3xl text-emerald-600 dark:text-emerald-400">{stats.avgAttendance}</div>
            <p className="mt-1 text-muted-foreground text-xs">across all your classes</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-colors hover:border-blue-500/50">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between font-semibold text-muted-foreground text-xs uppercase">
              Topics Logged
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-3xl">{stats.topicsCount}</div>
            <p className="mt-1 text-muted-foreground text-xs">curriculum modules logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Attendance Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-bold text-base">
              <Activity className="h-4 w-4 text-primary" /> Attendance Trends
            </CardTitle>
            <CardDescription>Average class attendance this week</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[200px] w-full">
              <AttendanceChart data={weeklyAttendanceData} />
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="bg-linear-to-b from-card to-muted/10 lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 font-bold text-lg">
              <Clock className="h-5 w-5 text-primary" /> Today's Scheduled Sessions
            </CardTitle>
            <CardDescription>Your upcoming classes for today</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!classes || classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-10 text-muted-foreground">
                <Calendar className="mb-3 h-10 w-10 opacity-20" />
                <p>No classes scheduled for today. Enjoy your time!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {classes.map((session) => (
                  <ClassSessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
