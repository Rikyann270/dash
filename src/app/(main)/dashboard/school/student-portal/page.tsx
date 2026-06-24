import {
  AlertCircle,
  Award,
  Calendar as CalendarIcon,
  CheckCircle,
  CheckSquare,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { getStudentDashboardData } from "@/app/actions/student-portal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { NotificationsCard } from "./_components/notifications-card";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const dynamic = "force-dynamic";

export default async function StudentPortalPage() {
  const data = await getStudentDashboardData();

  if (!data) {
    return (
      <div className="flex flex-col gap-6 p-6 lg:p-8 w-full max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-8 border">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Student Portal</h1>
          <p className="text-muted-foreground">No student profile found.</p>
        </div>
        <div className="text-muted-foreground p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium">Please run the Supabase seed script to populate sample student data.</p>
        </div>
      </div>
    );
  }

  const { student, timetable, attendance, invoices, results, notifications } = data;

  const totalDue = invoices.reduce((acc, inv) => acc + (Number(inv.amount_due) - Number(inv.amount_paid)), 0);
  const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.amount_due), 0);
  const paymentProgress = totalBilled > 0 ? ((totalBilled - totalDue) / totalBilled) * 100 : 100;

  // Dynamic attendance rate calculation
  const totalSessions = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  const initials = `${student.profiles?.first_name?.[0] || ""}${student.profiles?.last_name?.[0] || ""}`;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8 w-full max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600/10 via-primary/5 to-transparent border border-primary/10 shadow-sm">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-primary/10 to-transparent blur-3xl -z-10" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-8 relative z-10">
          <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
            <AvatarFallback className="bg-linear-to-br from-primary to-blue-600 text-white font-bold text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">Student Portal</h1>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 text-xs"
              >
                Active Student
              </Badge>
            </div>
            <p className="text-muted-foreground text-base">
              Welcome back,{" "}
              <span className="text-foreground font-semibold">
                {student.profiles?.first_name} {student.profiles?.last_name}
              </span>
              . Manage your academics and schedule below.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center">
              Academic Program
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{student.program_type}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-2 bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800"
              >
                {student.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:border-emerald-500/50 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center">
              Attendance Rate
              <Percent className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{attendanceRate}%</div>
            </div>
            <Progress
              value={attendanceRate}
              className="h-1.5 mt-3 bg-emerald-100 dark:bg-emerald-950"
              indicatorClassName="bg-emerald-500"
            />
            <p className="text-[10px] text-muted-foreground mt-2">Based on last {totalSessions} classes</p>
          </CardContent>
        </Card>

        <Card className="group hover:border-red-500/50 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center">
              Outstanding Balance
              <Wallet className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalDue > 0 ? "text-red-500" : "text-emerald-500"}`}>
              ${totalDue.toFixed(2)}
            </div>
            <Progress
              value={paymentProgress}
              className="h-1.5 mt-3 bg-red-100 dark:bg-red-950"
              indicatorClassName={totalDue > 0 ? "bg-red-500" : "bg-emerald-500"}
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              {totalDue > 0 ? `${paymentProgress.toFixed(0)}% paid of total billed` : "All clear, thank you!"}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:border-violet-500/50 transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center">
              Recorded Grades
              <Award className="h-4 w-4 text-violet-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{results.length}</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-violet-500" />
              <p className="text-xs text-muted-foreground">Assessments published</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Weekly Schedule & Attendance */}
        <div className="lg:col-span-7 space-y-6 w-full">
          {/* Timetable Schedule */}
          <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" /> Your Class Timetable
              </CardTitle>
              <CardDescription>Scheduled sessions for your cohort</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {timetable.map((session, index) => (
                  <div
                    key={session.id}
                    className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-background border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all relative overflow-hidden"
                  >
                    {/* Decorative side bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {session.subjects?.code}
                        </Badge>
                        <span className="font-bold text-foreground text-base">{session.subjects?.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="font-medium">Room: {session.room || "TBA"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                      <Badge className="bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-xs">
                        {DAYS_OF_WEEK[session.day_of_week]}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                            {session.teachers?.profiles?.first_name?.[0]}
                            {session.teachers?.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{session.teachers?.profiles?.last_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {timetable.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                    <CalendarIcon className="h-10 w-10 mb-3 opacity-20" />
                    <p>No timetable schedule found for your cohort.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Lessons (Academic Truth Engine) */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" /> Lesson History
              </CardTitle>
              <CardDescription>Verified academic records from your classes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {attendance.map((record: any) => {
                  const lesson = record.lesson_sessions;
                  if (!lesson) return null;

                  const subjectName = lesson.timetable_sessions?.subjects?.name;
                  const topics =
                    lesson.lesson_topics_covered?.map((tc: any) => tc.topics?.title).join(", ") || "General Review";

                  return (
                    <div
                      key={record.id}
                      className="flex flex-col border rounded-xl overflow-hidden hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between bg-muted/30 p-3 border-b">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-2 w-2 rounded-full ${record.status === "PRESENT" ? "bg-emerald-500" : record.status === "ABSENT" ? "bg-red-500" : "bg-yellow-500"}`}
                          />
                          <div>
                            <p className="font-bold text-foreground text-sm">{subjectName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(lesson.date).toLocaleDateString(undefined, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            record.status === "PRESENT"
                              ? "default"
                              : record.status === "ABSENT"
                                ? "destructive"
                                : "secondary"
                          }
                          className="shadow-xs"
                        >
                          {record.status}
                        </Badge>
                      </div>

                      <div className="p-4 space-y-3 bg-background">
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Topic Covered
                          </span>
                          <span className="text-sm font-medium">{topics}</span>
                        </div>

                        {lesson.homework_assigned && (
                          <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                              Homework
                            </span>
                            <span className="text-sm">{lesson.homework_assigned}</span>
                          </div>
                        )}

                        {record.teacher_comments && (
                          <div className="border-l-2 border-primary pl-3 py-1 italic">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-0.5">
                              Teacher Note
                            </span>
                            <span className="text-sm text-foreground">"{record.teacher_comments}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {attendance.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                    <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No recent lessons found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Grades & Financials */}
        <div className="lg:col-span-5 space-y-6 w-full">
          {/* Notifications Card */}
          <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
            <NotificationsCard initialNotifications={notifications} studentId={student.id} />
          </div>

          {/* Academic Results */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-violet-500" /> Grades & Performance
              </CardTitle>
              <CardDescription>Assessments and published scores</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="divide-y">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-foreground text-sm">{result.assessments?.title}</p>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground bg-muted/20">
                        {result.assessments?.subjects?.name}
                      </Badge>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <div className="font-bold text-lg">
                          {result.marks_obtained}{" "}
                          <span className="text-muted-foreground text-xs font-normal">
                            / {result.assessments?.total_marks}
                          </span>
                        </div>
                        <Progress
                          value={(result.marks_obtained / result.assessments?.total_marks) * 100}
                          className="h-1.5 w-16 mt-1"
                        />
                      </div>
                      <Badge
                        className={`font-bold text-sm px-3 py-1 shadow-xs ${result.grade?.startsWith("A") ? "bg-emerald-500 hover:bg-emerald-600" : result.grade?.startsWith("B") ? "bg-blue-500 hover:bg-blue-600" : "bg-foreground"}`}
                      >
                        {result.grade || "N/A"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No assessment marks published yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fee Ledger */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Financial Ledger
              </CardTitle>
              <CardDescription>Your bills and payments registry</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="divide-y">
                {invoices.map((inv) => {
                  const balance = Number(inv.amount_due) - Number(inv.amount_paid);
                  return (
                    <div key={inv.id} className="p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              inv.status === "PAID" ? "default" : inv.status === "PARTIAL" ? "secondary" : "destructive"
                            }
                            className={`shadow-xs ${inv.status === "PAID" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                          >
                            {inv.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            Due {new Date(inv.due_date).toLocaleDateString()}
                          </span>
                        </div>
                        {balance > 0 && (
                          <div className="text-sm text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-md">
                            ${balance.toFixed(2)} remaining
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Total Billed</p>
                          <p className="font-semibold">${inv.amount_due}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-xs text-muted-foreground">Amount Paid</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">${inv.amount_paid}</p>
                        </div>
                      </div>
                      <Progress
                        value={(Number(inv.amount_paid) / Number(inv.amount_due)) * 100}
                        className="h-1.5 mt-3"
                      />
                    </div>
                  );
                })}
                {invoices.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Wallet className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No invoices generated yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
