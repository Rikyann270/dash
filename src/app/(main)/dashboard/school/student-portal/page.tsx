import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Calendar as CalendarIcon,
  CheckSquare,
  CreditCard,
  FileText,
  GraduationCap,
  MapPin,
  Percent,
  TrendingUp,
  User,
  UserCheck,
  Wallet,
} from "lucide-react";

import { getStudentDashboardData } from "@/app/actions/student-portal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

import { NotificationsCard } from "./_components/notifications-card";
import { StudentAttendancePie } from "./_components/student-attendance-pie";
import { StudentCalendar } from "./_components/student-calendar";
import { StudentGradesTrend } from "./_components/student-grades-trend";

export const dynamic = "force-dynamic";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const quickActions = [
  { label: "Full Timetable", icon: CalendarIcon, href: "#" },
  { label: "Assignments", icon: FileText, href: "#" },
  { label: "Materials", icon: BookOpen, href: "#" },
  { label: "My Results", icon: Award, href: "#" },
  { label: "Pay Fees", icon: CreditCard, href: "#" },
  { label: "My Profile", icon: User, href: "#" },
] as const;

export default async function StudentPortalPage() {
  const data = await getStudentDashboardData();

  if (!data) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        <div className="rounded-xl border bg-card p-8 shadow-xs">
          <h1 className="mb-2 text-3xl tracking-tight">Student Portal</h1>
          <p className="text-muted-foreground">No student profile found.</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-muted/20 p-12 text-center text-muted-foreground">
          <AlertCircle className="h-10 w-10 opacity-30" />
          <p className="text-sm">Please run the Supabase seed script to populate sample student data.</p>
        </div>
      </div>
    );
  }

  const {
    student,
    primaryCohort,
    displaySchedule,
    attendanceRate,
    results,
    notifications,
    greeting,
    profileCompletion,
    todaySummary,
    myTasks,
    academicSnapshot,
    upcomingDeadlines,
    weeklyAttendanceHistory,
    feesSummary,
  } = data;

  const initials = `${student.profiles?.first_name?.[0] || ""}${student.profiles?.last_name?.[0] || ""}`;
  const _fullName = `${student.profiles?.first_name || ""} ${student.profiles?.last_name || ""}`.trim();

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ── Main Column (9/12) ── */}
      <section className="lg:col-span-9">
        <div className="flex flex-col gap-6">
          {/* 1. Greeting Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Avatar className="size-12 border">
                <AvatarFallback className="bg-primary font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl text-foreground leading-none tracking-tight">
                  {greeting}, {student.profiles?.first_name}.
                </h1>
                <p className="mt-1 text-lg text-muted-foreground leading-none">
                  {primaryCohort?.name || "Senior Stream A"} · Term {primaryCohort?.semester || "1"} ·{" "}
                  {primaryCohort?.year || "2026"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Today's Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="grid size-7 place-items-center rounded-lg border bg-muted">
                      <CalendarIcon className="size-4" />
                    </div>
                    Today
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-2xl leading-none tracking-tight">{todaySummary.classesCount}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground tabular-nums leading-none">classes scheduled</p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="grid size-7 place-items-center rounded-lg border bg-muted">
                      <Percent className="size-4" />
                    </div>
                    Attendance
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-2xl leading-none tracking-tight">{attendanceRate}%</div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground tabular-nums leading-none">this term</p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="grid size-7 place-items-center rounded-lg border bg-muted">
                      <Bell className="size-4" />
                    </div>
                    Updates
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-2xl leading-none tracking-tight">{todaySummary.notificationsCount}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground tabular-nums leading-none">new notifications</p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Today's Schedule (Tasks-style list) */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl tracking-tight">Today&apos;s Schedule</h2>
              <Badge variant="outline" className="font-normal">
                {DAYS_OF_WEEK[new Date().getDay()]}
              </Badge>
            </div>
            <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
              <div className="divide-y">
                {displaySchedule.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
                    No classes scheduled for today.
                  </div>
                ) : (
                  displaySchedule.map((session: any) => (
                    <div key={session.id} className="flex items-center gap-3 p-4">
                      <div
                        className={`size-2 shrink-0 rounded-full ${session.isActive ? "bg-green-500" : "bg-muted-foreground/30"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                            <span className="truncate text-sm">{session.subjects?.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="px-3 py-1 font-normal text-xs">
                                {session.subjects?.code}
                              </Badge>
                              {session.isActive && (
                                <Badge className="bg-green-500 px-2 py-0.5 font-normal text-[10px] text-white">
                                  Now
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
                            <span className="tabular-nums">
                              {session.start_time?.substring(0, 5)} – {session.end_time?.substring(0, 5)}
                            </span>
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="size-3" />
                              <span>{session.room || "TBA"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* 4. My Tasks */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl tracking-tight">My Tasks & Alerts</h2>
              <Button variant="outline" size="sm">
                <CheckSquare className="mr-1.5 size-4" />
                View All
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
              <div className="divide-y">
                {myTasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-center gap-3 p-4">
                    <Checkbox
                      checked={task.status === "completed"}
                      aria-label={task.title}
                      disabled={task.type === "alert-present" || task.type === "alert-absent"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                          <span className="truncate text-sm">{task.title}</span>
                          <Badge variant="outline" className="w-fit px-3 py-1 font-normal text-xs">
                            {task.type === "alert-present"
                              ? "Present"
                              : task.type === "alert-absent"
                                ? "Absent"
                                : task.type}
                          </Badge>
                        </div>
                        <div className="shrink-0 text-muted-foreground text-xs">
                          {task.badgeColor.replace(/^[^\s]*\s/, "")}
                        </div>
                      </div>
                      {task.meta?.comment && (
                        <p className="mt-1 text-muted-foreground text-xs italic">"{task.meta.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Academic Snapshot — Projects-style grid */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl tracking-tight">Academic Snapshot</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-muted-foreground" />
                      <span>Average Grade</span>
                    </div>
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      {academicSnapshot.assignmentsCompleted}/{academicSnapshot.assignmentsTotal} done
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <div className="text-muted-foreground text-sm leading-none">Current performance</div>
                    <div className="flex items-center gap-3">
                      <Progress value={academicSnapshot.classAverage} className="h-2" />
                      <span className="shrink-0 text-sm">{academicSnapshot.classAverage}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="py-2.5">
                  <span className="text-muted-foreground">Position: {academicSnapshot.classPosition}</span>
                </CardFooter>
              </Card>

              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      <span>Credits</span>
                    </div>
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">{academicSnapshot.creditsCompleted} / 60</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <div className="text-muted-foreground text-sm leading-none">Credits completed</div>
                    <div className="flex items-center gap-3">
                      <Progress value={(academicSnapshot.creditsCompleted / 60) * 100} className="h-2" />
                      <span className="shrink-0 text-sm">
                        {Math.round((academicSnapshot.creditsCompleted / 60) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="py-2.5">
                  <span className="text-muted-foreground">{academicSnapshot.upcomingExams} exams upcoming</span>
                </CardFooter>
              </Card>

              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-4 text-muted-foreground" />
                      <span>Attendance</span>
                    </div>
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">{attendanceRate}%</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    <div className="text-muted-foreground text-sm leading-none">This term</div>
                    <div className="flex items-center gap-3">
                      <Progress value={attendanceRate} className="h-2" />
                      <span className="shrink-0 text-sm">{attendanceRate}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="py-2.5">
                  <span className="text-muted-foreground">Profile {profileCompletion}% complete</span>
                </CardFooter>
              </Card>
            </div>

            {/* Charts row */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm">Attendance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentAttendancePie rate={attendanceRate} />
                </CardContent>
              </Card>
              <Card className="shadow-xs">
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm">Grades Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentGradesTrend results={results} />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 6. Quick Actions */}
          <section className="flex flex-col gap-2">
            <h2 className="text-xl tracking-tight">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" className="justify-start" asChild>
                  <Link href={action.href}>
                    <action.icon className="mr-2 size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </section>

          {/* 7. Quote / Motivational Banner */}
          <section className="rounded-2xl border bg-card p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="grid size-8 shrink-0 place-items-center text-muted-foreground">
                <BookMarked className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xl leading-none tracking-tight">Stay consistent, stay ahead.</p>
                <p className="text-muted-foreground">Every lesson attended builds your future.</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ── Right Sidebar Column (3/12) ── */}
      <section className="flex flex-col gap-6 lg:col-span-3">
        {/* Calendar Panel */}
        <StudentCalendar timetable={data.timetable} />

        {/* Fees Overview */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-muted-foreground" />
              Fees
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Pay
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              {feesSummary.totalDue > 0
                ? `You have an outstanding balance. Please settle by the due date.`
                : `You're all paid up. Great work!`}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">UGX {feesSummary.totalPaid.toLocaleString()} paid</span>
                <span className="text-muted-foreground">
                  {Math.round((feesSummary.totalPaid / (feesSummary.totalBilled || 1)) * 100)}%
                </span>
              </div>
              <Progress value={(feesSummary.totalPaid / (feesSummary.totalBilled || 1)) * 100} className="h-2" />
            </div>
            {feesSummary.totalDue > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Balance due</span>
                <span className="font-semibold">UGX {feesSummary.totalDue.toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <NotificationsCard initialNotifications={notifications} studentId={student.id} />

        {/* Upcoming Deadlines */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {upcomingDeadlines.map((dl) => (
              <div key={dl.id} className="flex items-start gap-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate font-medium text-sm leading-none">{dl.title}</div>
                  <div className="mt-1 text-muted-foreground text-xs">
                    {dl.day} · {dl.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Attendance Tracker */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">Your attendance record for this week.</p>
            {weeklyAttendanceHistory.map((subj: any, sIdx: number) => (
              <div key={sIdx} className="flex flex-col gap-2">
                <div className="font-medium text-sm">{subj.subject}</div>
                <div className="flex gap-1">
                  {subj.days.map((d: any, dIdx: number) => (
                    <div key={dIdx} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.status}`}>
                      <span className="font-mono text-[9px] text-muted-foreground">{d.day}</span>
                      <span
                        className={`font-bold text-xs ${d.status === "present" ? "text-green-500" : "text-red-500"}`}
                      >
                        {d.status === "present" ? "✓" : "✗"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
