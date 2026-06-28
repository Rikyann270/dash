"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function getTodayClasses() {
  const supabase = await createClient();

  // In a real app, you filter by the logged-in teacher_id and today's day_of_week
  // const dayOfWeek = new Date().getDay()

  const { data, error } = await supabase
    .from("timetable_sessions")
    .select(`
      *,
      classes(name),
      subjects(name, code),
      teachers(
        profiles(first_name, last_name)
      )
    `)
    // .eq('day_of_week', dayOfWeek)
    .order("start_time");

  if (error) {
    console.error("Error fetching today classes:", error);
    return [];
  }
  return data;
}

export async function getStudentsForClass(classId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_enrollments")
    .select("students(*, profiles!students_profile_id_fkey(first_name, last_name))")
    .eq("class_id", classId);

  if (error) {
    console.error("Error fetching students for class:", error);
    return [];
  }

  // Flatten the response
  return data.map((row: any) => row.students);
}

async function upsertAttendanceNotification(
  supabase: any,
  studentId: string,
  sessionId: string,
  status: string,
  date: string,
) {
  try {
    // Fetch session details
    const { data: sessionData } = await supabase
      .from("timetable_sessions")
      .select(`
        *,
        subjects(name, code),
        teachers(
          id,
          profiles(first_name, last_name)
        )
      `)
      .eq("id", sessionId)
      .single();

    if (!sessionData) return;

    const subjectName = sessionData.subjects?.name || "Class";
    const teacherName = sessionData.teachers?.profiles
      ? `${sessionData.teachers.profiles.first_name} ${sessionData.teachers.profiles.last_name}`
      : "Teacher";
    const teacherId = sessionData.teachers?.id || null;

    const title = `Attendance Update: ${subjectName}`;
    const message = `You have been marked ${status} for ${subjectName} by ${teacherName} on ${date}.`;

    // Look for existing notification for this session and student created today
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("student_id", studentId)
      .eq("timetable_session_id", sessionId)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .maybeSingle();

    if (existing?.id) {
      // Update existing notification and reset is_read to false
      await supabase
        .from("notifications")
        .update({
          title,
          message,
          is_read: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new notification
      await supabase.from("notifications").insert({
        student_id: studentId,
        teacher_id: teacherId,
        timetable_session_id: sessionId,
        title,
        message,
        is_read: false,
      });
    }
  } catch (error) {
    console.error("Failed to upsert attendance notification:", error);
  }
}

export async function submitAttendance(formData: FormData) {
  const supabase = await createClient();

  const _classId = formData.get("classId") as string;
  const studentId = formData.get("studentId") as string;
  const status = formData.get("status") as string; // PRESENT, ABSENT, LATE
  const sessionId = formData.get("sessionId") as string; // This is the timetable_session_id
  const lessonSessionId = formData.get("lessonSessionId") as string; // The actual lesson_session_id
  const date = new Date().toISOString().split("T")[0];

  if (!lessonSessionId) throw new Error("Lesson session ID is required");

  // Ensure lesson session is not submitted
  const { data: sessionData } = await supabase
    .from("lesson_sessions")
    .select("status")
    .eq("id", lessonSessionId)
    .single();
  if (sessionData?.status === "SUBMITTED") throw new Error("Lesson is already submitted and locked.");

  const { error } = await supabase.from("attendance").upsert(
    {
      student_id: studentId,
      lesson_session_id: lessonSessionId,
      status: status,
    },
    { onConflict: "student_id, lesson_session_id" },
  );

  if (error) throw error;

  // Create or update notification for student
  await upsertAttendanceNotification(supabase, studentId, sessionId, status, date);

  revalidatePath("/dashboard/school/student-portal");
  revalidatePath("/dashboard/school/teacher-portal");
}

export async function editNotification(formData: FormData) {
  const supabase = await createClient();
  const notificationId = formData.get("notificationId") as string;
  const title = formData.get("title") as string;
  const message = formData.get("message") as string;

  if (!notificationId || !title || !message) {
    throw new Error("Notification ID, title, and message are required");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      title,
      message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) throw error;

  revalidatePath("/dashboard/school/student-portal");
  revalidatePath("/dashboard/school/teacher-portal");
}

export async function getTopicsForSubject(subjectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("topics").select("*").eq("subject_id", subjectId).order("order_index");
  if (error) return [];
  return data;
}

export async function submitLessonCoverage(formData: FormData) {
  const supabase = await createClient();

  const lessonSessionId = formData.get("lessonSessionId") as string;
  const topicId = formData.get("topicId") as string;
  const coverageStatus = (formData.get("coverageStatus") as string) || "COMPLETED";
  const notes = formData.get("notes") as string;

  // Ensure lesson session is not submitted
  const { data: sessionData } = await supabase
    .from("lesson_sessions")
    .select("status")
    .eq("id", lessonSessionId)
    .single();
  if (sessionData?.status === "SUBMITTED") throw new Error("Lesson is already submitted and locked.");

  // Update summary in lesson_sessions
  if (notes) {
    await supabase.from("lesson_sessions").update({ summary: notes }).eq("id", lessonSessionId);
  }

  const { error } = await supabase.from("lesson_topics_covered").upsert(
    {
      lesson_session_id: lessonSessionId,
      topic_id: topicId,
      coverage_status: coverageStatus,
    },
    { onConflict: "lesson_session_id, topic_id" },
  );

  if (error) throw error;
}

export async function getNotificationsForSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*, students(profiles!students_profile_id_fkey(first_name, last_name))")
    .eq("timetable_session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications for session:", error);
    return [];
  }
  return data;
}
