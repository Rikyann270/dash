import { GraduationCap, Wallet, CheckSquare, Calendar as CalendarIcon, MapPin, Clock, FileText, CheckCircle, Percent } from "lucide-react";
import { getStudentDashboardData } from "@/app/actions/student-portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsCard } from "./_components/notifications-card";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const dynamic = 'force-dynamic';

export default async function StudentPortalPage() {
  const data = await getStudentDashboardData();

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Student Portal</h1>
        <div className="text-muted-foreground p-8 text-center border border-dashed rounded-xl bg-muted/20">
          No student profile found. Please run the Supabase seed script to populate sample student data.
        </div>
      </div>
    );
  }

  const { student, timetable, attendance, invoices, results, notifications } = data;


  const totalDue = invoices.reduce((acc, inv) => acc + (Number(inv.amount_due) - Number(inv.amount_paid)), 0);

  // Dynamic attendance rate calculation
  const totalSessions = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(0) : null;

  const initials = `${student.profiles?.first_name?.[0] || ""}${student.profiles?.last_name?.[0] || ""}`;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-xl border">
        <Avatar className="h-14 w-14 bg-primary/10">
          <AvatarFallback className="text-primary font-bold text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Student Portal</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="text-foreground font-semibold">{student.profiles?.first_name} {student.profiles?.last_name}</span>. Track your academic schedule and financials below.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Academic Program</CardTitle>
            <CardAction>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.program_type}</div>
            <p className="text-xs text-muted-foreground mt-1">Status: <Badge variant="outline" className="text-[10px] py-0 px-1">{student.status}</Badge></p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Outstanding Balance</CardTitle>
            <CardAction>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDue > 0 ? "text-red-500" : "text-emerald-500"}`}>
              ${totalDue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDue > 0 ? "Outstanding balance pending" : "All clear, thank you!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Attendance Rate</CardTitle>
            <CardAction>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate ? `${attendanceRate}%` : "100%"}</div>
            <p className="text-xs text-muted-foreground mt-1">based on last {totalSessions} classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Recorded Grades</CardTitle>
            <CardAction>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground mt-1">assessments published</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 w-full">
        {/* Left Column: Weekly Schedule & Attendance */}
        <div className="lg:col-span-7 space-y-6 w-full min-w-0">
          {/* Timetable Schedule */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" /> Your Class Timetable
              </CardTitle>
              <CardDescription>Scheduled sessions for your cohort</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {timetable.map((session) => (
                  <div key={session.id} className="flex items-start justify-between border-b pb-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">
                          {session.subjects?.code}
                        </span>
                        <span className="font-bold text-foreground">{session.subjects?.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Room: {session.room || "TBA"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="rounded-sm font-semibold text-xs">
                        {DAYS_OF_WEEK[session.day_of_week]}
                      </Badge>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Lec: {session.teachers?.profiles?.first_name} {session.teachers?.profiles?.last_name}
                      </div>
                    </div>
                  </div>
                ))}
                {timetable.length === 0 && (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded">
                    No timetable schedule found for your cohort.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Lessons (Academic Truth Engine) */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> My Lessons
              </CardTitle>
              <CardDescription>Verified academic records from your classes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {attendance.map((record: any) => {
                  const lesson = record.lesson_sessions;
                  if (!lesson) return null;
                  
                  const subjectName = lesson.timetable_sessions?.subjects?.name;
                  const topics = lesson.lesson_topics_covered?.map((tc: any) => tc.topics?.title).join(', ') || 'General Review';
                  
                  return (
                    <div key={record.id} className="flex flex-col border-b pb-4 text-sm gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{subjectName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(lesson.date).toLocaleDateString()}</p>
                        </div>
                        <Badge 
                          variant={record.status === 'PRESENT' ? 'default' : record.status === 'ABSENT' ? 'destructive' : 'secondary'}
                          className="rounded-sm text-[10px]"
                        >
                          {record.status}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded-md space-y-2 mt-1">
                        <div>
                          <span className="font-semibold text-xs text-muted-foreground">Topic Covered: </span>
                          <span className="text-sm font-medium">{topics}</span>
                        </div>
                        
                        {lesson.homework_assigned && (
                          <div>
                            <span className="font-semibold text-xs text-muted-foreground">Homework: </span>
                            <span className="text-sm">{lesson.homework_assigned}</span>
                          </div>
                        )}
                        
                        {record.teacher_comments && (
                          <div className="border-l-2 border-primary pl-2 italic">
                            <span className="font-semibold text-xs text-muted-foreground">Teacher Comment: </span>
                            <span className="text-sm text-muted-foreground">"{record.teacher_comments}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {attendance.length === 0 && (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded">
                    No recent lessons found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Grades & Financials */}
        <div className="lg:col-span-5 space-y-6 w-full min-w-0">
          {/* Notifications Card */}
          <NotificationsCard initialNotifications={notifications} studentId={student.id} />

          {/* Academic Results */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" /> Grades & Performance
              </CardTitle>
              <CardDescription>Assessments and published scores</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="flex items-center justify-between border-b pb-2 text-sm">
                    <div>
                      <p className="font-bold text-foreground">{result.assessments?.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.assessments?.subjects?.name}</p>
                    </div>
                    <div className="text-right flex items-center gap-2.5">
                      <div>
                        <div className="font-bold text-foreground">
                          {result.marks_obtained} / {result.assessments?.total_marks}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Grade equivalent</div>
                      </div>
                      <Badge className="font-bold text-xs px-2 py-0.5" variant="outline">
                        {result.grade || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded">
                    No assessment marks published yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fee Ledger */}
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Financial Invoice Ledger
              </CardTitle>
              <CardDescription>Your bills and payments registry</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {invoices.map((inv) => {
                  const balance = Number(inv.amount_due) - Number(inv.amount_paid);
                  return (
                    <div key={inv.id} className="flex items-center justify-between border-b pb-3 text-sm">
                      <div>
                        <p className="font-bold text-foreground">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Billed: ${inv.amount_due} · Paid: ${inv.amount_paid}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={inv.status === 'PAID' ? 'default' : inv.status === 'PARTIAL' ? 'secondary' : 'destructive'}
                          className="rounded-sm text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                        {balance > 0 && (
                          <div className="text-xs text-red-500 font-bold mt-1">
                            ${balance.toFixed(2)} due
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {invoices.length === 0 && (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded">
                    No invoices generated yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

