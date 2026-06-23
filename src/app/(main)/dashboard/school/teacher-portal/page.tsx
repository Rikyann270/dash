import { getTodayClasses } from "@/app/actions/teacher-portal";
import { ClassSessionCard } from "./_components/class-session-card";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Calendar, CheckSquare, BarChart, BookOpen } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TeacherPortalPage() {
  const classes = await getTodayClasses();
  const supabase = await createClient();

  // Load metrics dynamically for the current teacher (demo grabs the first available teacher)
  const { data: teacher } = await supabase.from('teachers').select('id, profiles(first_name, last_name)').limit(1).single();

  let stats = { classesCount: 0, topicsCount: 0, avgAttendance: '100%' };
  let teacherName = "Faculty Member";

  if (teacher) {
    const profile: any = Array.isArray(teacher.profiles) ? teacher.profiles[0] : teacher.profiles;
    teacherName = profile ? `${profile.first_name} ${profile.last_name}` : "Faculty Member";
    const [sessions, coverage, attendance] = await Promise.all([
      supabase.from('timetable_sessions').select('id').eq('teacher_id', teacher.id),
      supabase.from('lesson_sessions').select('id').eq('actual_teacher_id', teacher.id).in('status', ['SUBMITTED']),
      supabase.from('attendance')
        .select('status, lesson_sessions!inner(id, actual_teacher_id)')
        .eq('lesson_sessions.actual_teacher_id', teacher.id)
    ]);

    const totalAtt = attendance.data?.length || 0;
    const presentAtt = attendance.data?.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length || 0;
    
    stats = {
      classesCount: sessions.data?.length || 0,
      topicsCount: coverage.data?.length || 0,
      avgAttendance: totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(0) + '%' : '100%'
    };
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Portal</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back, <span className="text-foreground font-semibold">{teacherName}</span>. Track student attendance and curriculum progression.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Weekly Teaching Load</CardTitle>
            <CardAction>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classesCount} Classes</div>
            <p className="text-xs text-muted-foreground mt-1">assigned sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Average Attendance</CardTitle>
            <CardAction>
              <BarChart className="h-4 w-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.avgAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">across all your classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Topics Logged</CardTitle>
            <CardAction>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topicsCount} Covered</div>
            <p className="text-xs text-muted-foreground mt-1">curriculum modules logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Today's Scheduled Sessions</h2>
        {(!classes || classes.length === 0) ? (
          <div className="text-muted-foreground p-8 text-center border border-dashed rounded-xl bg-muted/20">
            No classes scheduled for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((session) => (
              <ClassSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

