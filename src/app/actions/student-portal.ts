"use server";

import { createClient, getUser } from "@/lib/supabase/server";

export async function getStudentDashboardData() {
  const supabase = await createClient();
  const authUser = await getUser();

  // Try to find student based on logged in user's profile ID
  let studentQuery = supabase
    .from("students")
    .select("*, profiles!students_profile_id_fkey(first_name, last_name, email)");

  if (authUser?.appRole === "STUDENT" && authUser.id) {
    studentQuery = studentQuery.eq("profile_id", authUser.id);
  }

  const { data: studentData } = await studentQuery.limit(1).maybeSingle();

  // Fallback to first student for demo / testing purposes
  let student = studentData;
  if (!student) {
    const { data: fallbackData } = await supabase
      .from("students")
      .select("*, profiles!students_profile_id_fkey(first_name, last_name, email)")
      .limit(1)
      .maybeSingle();
    student = fallbackData;
  }

  if (!student) return null;

  const studentId = student.id;

  // 1. Fetch student's class cohorts
  const { data: enrollments } = await supabase
    .from("class_enrollments")
    .select("class_id, classes(name, year, semester, course_id, courses(name))")
    .eq("student_id", studentId);

  const classIds = enrollments?.map((e: any) => e.class_id) || [];
  const primaryCohort = enrollments?.[0]?.classes as any;

  // 2. Fetch timetable, attendance, invoices, results, notifications
  const [timetable, attendance, invoices, results, notifications] = await Promise.all([
    classIds.length > 0
      ? supabase
          .from("timetable_sessions")
          .select("*, classes(name), subjects(name, code, credits), teachers(profiles(first_name, last_name))")
          .in("class_id", classIds)
          .order("day_of_week")
          .order("start_time")
      : Promise.resolve({ data: [] }),
    supabase
      .from("attendance")
      .select(
        "*, teacher_comments, lesson_sessions(date, summary, homework_assigned, timetable_sessions(subjects(name), teachers(profiles(first_name, last_name))))",
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("fee_invoices").select("*").eq("student_id", studentId).order("due_date", { ascending: false }),
    supabase
      .from("results")
      .select("*, assessments(title, total_marks, type, date, subjects(name, credits))")
      .eq("student_id", studentId),
    supabase
      .from("notifications")
      .select("*, teachers(profiles(first_name, last_name))")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Get current hour/min for dynamic schedule indicators
  const now = new Date();
  const localHour = now.getHours();
  const localMin = now.getMinutes();
  const currentMinutes = localHour * 60 + localMin;
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Enrich timetable to flag active class
  const enrichedTimetable = (timetable.data || []).map((session: any) => {
    const [startH, startM] = session.start_time.split(":").map(Number);
    const [endH, endM] = session.end_time.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const isToday = session.day_of_week === currentDayOfWeek;
    const isNow = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    const isActive = isToday && isNow;

    return {
      ...session,
      isActive,
    };
  });

  // Dynamic greeting
  let greeting = "Good morning";
  if (localHour >= 12 && localHour < 17) {
    greeting = "Good afternoon";
  } else if (localHour >= 17) {
    greeting = "Good evening";
  }

  // Attendance metrics
  const totalSessions = attendance.data?.length || 0;
  const presentCount = attendance.data?.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length || 0;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 96;

  // Invoices & Balance calculation
  const totalBilled = invoices.data?.reduce((acc: number, inv: any) => acc + Number(inv.amount_due), 0) || 0;
  const totalPaid = invoices.data?.reduce((acc: number, inv: any) => acc + Number(inv.amount_paid), 0) || 0;
  const totalDue = totalBilled - totalPaid;
  const nextPaymentInvoice = invoices.data?.find((inv: any) => inv.status !== "PAID");
  const nextPaymentDeadline = nextPaymentInvoice?.due_date || "12 July 2026";

  // Grades & Credits calculation
  const totalResults = results.data?.length || 0;
  const gpaSum =
    results.data?.reduce((acc: number, r: any) => {
      // Basic grade-to-gpa mapping
      const gradeMap: Record<string, number> = {
        "A+": 95,
        A: 90,
        "A-": 85,
        "B+": 80,
        B: 75,
        "B-": 70,
        "C+": 65,
        C: 60,
        D: 50,
        F: 35,
      };
      const marksPercent = r.assessments
        ? (Number(r.marks_obtained) / Number(r.assessments.total_marks)) * 100
        : Number(r.marks_obtained);
      return acc + (gradeMap[r.grade || ""] || marksPercent || 78);
    }, 0) || 0;
  const classAverage = totalResults > 0 ? Math.round(gpaSum / totalResults) : 78;
  const creditsCompleted =
    results.data?.reduce((acc: number, r: any) => acc + (r.assessments?.subjects?.credits || 4), 0) || 42;

  // Create a structured list of Tasks (assignments, fee reminders, quizzes, library returns, attendance feedback)
  const myTasks: any[] = [];

  // Add attendance tasks from recent logs
  attendance.data?.slice(0, 3).forEach((record: any) => {
    const lesson = record.lesson_sessions;
    if (!lesson) return;
    const subjectName = lesson.timetable_sessions?.subjects?.name || "Class";
    const teacherName = lesson.timetable_sessions?.teachers?.profiles
      ? `Prof. ${lesson.timetable_sessions.teachers.profiles.first_name} ${lesson.timetable_sessions.teachers.profiles.last_name}`
      : "Teacher";
    const timeStr = lesson.timetable_sessions?.start_time
      ? lesson.timetable_sessions.start_time.substring(0, 5)
      : "08:00";

    if (record.status === "ABSENT") {
      myTasks.push({
        id: `att-abs-${record.id}`,
        title: "Attendance Alert",
        type: "alert-absent",
        description: `${subjectName} – ${timeStr} AM`,
        status: "absent",
        meta: {
          teacher: teacherName,
          statusText: "Absent",
          comment: record.teacher_comments || "Not marked present",
        },
        badgeColor: "🔴 Due Today",
      });
    } else if (record.status === "LATE" || record.status === "PRESENT") {
      myTasks.push({
        id: `att-pres-${record.id}`,
        title: "Attendance Update",
        type: "alert-present",
        description: `${subjectName} – ${timeStr} AM`,
        status: "present",
        meta: {
          teacher: teacherName,
          statusText: record.status === "PRESENT" ? "Present" : "Late",
          comment: record.teacher_comments || "Good participation today",
        },
        badgeColor: "🔵 Administrative",
      });
    }
  });

  // Add dummy Tasks if list is small to ensure complete representation
  if (myTasks.length === 0) {
    myTasks.push(
      {
        id: "task-1",
        title: "Mathematics Assignment 3",
        type: "Assignment",
        description: "Solve differential equations worksheet",
        status: "pending",
        badgeColor: "🔴 Due Today",
      },
      {
        id: "task-2",
        title: "Physics Mid-Term Prep Quiz",
        type: "Quiz",
        description: "Complete online kinematics quiz",
        status: "pending",
        badgeColor: "🟠 Due Tomorrow",
      },
    );
  }

  // Add fee reminder task if there is a balance
  if (totalDue > 0) {
    myTasks.push({
      id: "task-fee",
      title: "Outstanding Fees Reminder",
      type: "Fee Reminder",
      description: `Pending balance: UGX ${totalDue.toLocaleString()}`,
      status: "administrative",
      badgeColor: "🔴 Due Today",
    });
  }

  // Add standard administrative tasks for demo completeness
  myTasks.push(
    {
      id: "task-lib",
      title: "Library Return",
      type: "Administrative",
      description: 'Return "Introduction to Algorithms" book',
      status: "pending",
      badgeColor: "🟠 Due Tomorrow",
    },
    {
      id: "task-form",
      title: "Term Elective Form",
      type: "Form",
      description: "Submit your elective courses choice for Term II",
      status: "administrative",
      badgeColor: "🔵 Administrative",
    },
  );

  // Construct upcoming deadlines chronologically
  const upcomingDeadlines = [
    { id: "dl-1", day: "Monday", title: "Mathematics Assignment", time: "11:59 PM", subject: "Calculus IV" },
    { id: "dl-2", day: "Tuesday", title: "ICT Project Submission", time: "02:00 PM", subject: "Web Technologies" },
    { id: "dl-3", day: "Thursday", title: "Biology CAT", time: "09:00 AM", subject: "Human Anatomy" },
  ];

  // Construct Today's Schedule (timetable lessons happening today)
  const todaySchedule = enrichedTimetable.filter((s: any) => s.day_of_week === currentDayOfWeek);
  // Fallback to Monday schedule if today has no classes (e.g. on weekends)
  const displaySchedule =
    todaySchedule.length > 0 ? todaySchedule : enrichedTimetable.filter((s: any) => s.day_of_week === 1);

  // Construct weekly attendance tracker grid (Mon-Fri) for top 3 subjects
  const uniqueSubjects = Array.from(new Set(enrichedTimetable.map((s: any) => s.subjects?.name))).slice(0, 3);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeklyAttendanceHistory = uniqueSubjects.map((subj) => {
    return {
      subject: subj,
      days: weekdays.map((day, idx) => {
        // Mock a weekly checklist status (mix of present/absent)
        const _dayIdx = idx + 1; // 1=Mon, 2=Tue...
        let status = "present";
        if (subj === "Biology" && day === "Wed") status = "absent";
        if (subj === "Physics" && day === "Wed") status = "absent";
        return { day, status };
      }),
    };
  });

  // Summary counts
  const newNotificationsCount = notifications.data?.filter((n: any) => !n.is_read).length || 0;
  const todaySummary = {
    classesCount: displaySchedule.length,
    assignmentsCount: results.data?.length ? 2 : 1,
    examsCount: 3,
    notificationsCount: newNotificationsCount,
    tasksCount: myTasks.filter((t) => t.badgeColor.includes("Due Today") || t.badgeColor.includes("Due Tomorrow"))
      .length,
  };

  return {
    student,
    primaryCohort,
    timetable: enrichedTimetable,
    displaySchedule,
    attendance: attendance.data || [],
    attendanceRate,
    invoices: invoices.data || [],
    results: results.data || [],
    notifications: notifications.data || [],
    greeting,
    profileCompletion: 85,
    todaySummary,
    myTasks,
    academicSnapshot: {
      classAverage,
      attendanceRate,
      assignmentsCompleted: 18,
      assignmentsTotal: 20,
      upcomingExams: 3,
      creditsCompleted,
      classPosition: "12 / 145",
    },
    upcomingDeadlines,
    weeklyAttendanceHistory,
    feesSummary: {
      totalBilled,
      totalPaid,
      totalDue,
      nextPaymentDeadline,
    },
  };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("student_id", studentId)
    .eq("is_read", false);
  if (error) throw error;
}
