import { Activity, BarChart as BarChartIcon, BookOpen, Calendar, CheckSquare, Clock } from "lucide-react";

import { getTodayClasses } from "@/app/actions/teacher-portal";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      avgAttendance: totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(0) + "%" : "100%",
    };
  }

  // Mock data for weekly attendance chart
  const weeklyAttendanceData = [
    { day: "Mon", attendance: 95 },
    { day: "Tue", attendance: 88 },
    { day: "Wed", attendance: 92 },
    { day: "Thu", attendance: 85 },
    { day: "Fri", attendance: parseInt(stats.avgAttendance) || 90 },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8 w-full max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-500/10 via-violet-500/5 to-transparent p-8 border">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Teacher Portal</h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Welcome back, <span className="text-foreground font-semibold">{teacherName}</span>. Track student
            attendance, manage curriculum progression, and view your schedule.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-violet-500/20 to-transparent opacity-50 blur-3xl -z-10" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden group hover:border-violet-500/50 transition-colors">
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Weekly Teaching Load
              <Calendar className="h-4 w-4 text-violet-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.classesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">assigned sections</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Average Attendance
              <BarChartIcon className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avgAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">across all your classes</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Topics Logged
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.topicsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">curriculum modules logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Weekly Attendance Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
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
        <Card className="lg:col-span-2 bg-linear-to-b from-card to-muted/10">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Today's Scheduled Sessions
            </CardTitle>
            <CardDescription>Your upcoming classes for today</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!classes || classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                <Calendar className="h-10 w-10 mb-3 opacity-20" />
                <p>No classes scheduled for today. Enjoy your time!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
