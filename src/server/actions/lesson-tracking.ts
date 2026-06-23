"use server";

import { createClient } from "@/lib/supabase/server";

export type LessonStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'SUBMITTED' | 'SKIPPED' | 'CANCELLED';
export type TopicCoverageStatus = 'STARTED' | 'CONTINUED' | 'COMPLETED';

export async function initiateLesson(
  timetableSessionId: string,
  date: string,
  teacherId: string,
  actualTeacherId?: string
) {
  const supabase = await createClient();

  // Check if session already exists
  const { data: existingSession } = await supabase
    .from("lesson_sessions")
    .select("id, status")
    .eq("timetable_session_id", timetableSessionId)
    .eq("date", date)
    .single();

  if (existingSession) {
    return { 
      success: true, 
      lessonId: existingSession.id,
      isLocked: existingSession.status === 'SUBMITTED'
    };
  }

  // Create new session in IN_PROGRESS state
  const { data, error } = await supabase
    .from("lesson_sessions")
    .insert({
      timetable_session_id: timetableSessionId,
      date,
      actual_teacher_id: actualTeacherId || teacherId,
      status: "IN_PROGRESS",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error initiating lesson:", error);
    throw new Error("Failed to start lesson session.");
  }

  // Log to audit
  await supabase.from("lesson_audit_logs").insert({
    lesson_session_id: data.id,
    actor_id: teacherId, // Assuming teacherId maps to a profile
    action: "STARTED",
  });

  return { success: true, lessonId: data.id };
}

export async function saveLessonEvidence(
  lessonId: string,
  payload: {
    summary?: string;
    homework_assigned?: string;
    issues_interruptions?: string;
    topics?: { topic_id: string; coverage_status: TopicCoverageStatus }[];
    attendance?: { student_id: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; teacher_comments?: string }[];
  }
) {
  const supabase = await createClient();

  // Verify it's not submitted
  const { data: session } = await supabase
    .from("lesson_sessions")
    .select("status")
    .eq("id", lessonId)
    .single();

  if (!session || session.status === 'SUBMITTED') {
    throw new Error("Cannot modify a submitted lesson.");
  }

  // Update text fields
  if (payload.summary !== undefined || payload.homework_assigned !== undefined || payload.issues_interruptions !== undefined) {
    await supabase.from("lesson_sessions").update({
      summary: payload.summary,
      homework_assigned: payload.homework_assigned,
      issues_interruptions: payload.issues_interruptions,
      updated_at: new Date().toISOString(),
    }).eq("id", lessonId);
  }

  // Upsert topics
  if (payload.topics && payload.topics.length > 0) {
    const topicUpserts = payload.topics.map(t => ({
      lesson_session_id: lessonId,
      topic_id: t.topic_id,
      coverage_status: t.coverage_status,
    }));
    await supabase.from("lesson_topics_covered").upsert(topicUpserts, { onConflict: 'lesson_session_id,topic_id' });
  }

  // Upsert attendance
  if (payload.attendance && payload.attendance.length > 0) {
    const attendanceUpserts = payload.attendance.map(a => ({
      lesson_session_id: lessonId,
      student_id: a.student_id,
      status: a.status,
      teacher_comments: a.teacher_comments,
    }));
    // Note: Upsert needs to know the constraint, unique constraint is (student_id, lesson_session_id)
    await supabase.from("attendance").upsert(attendanceUpserts, { onConflict: 'student_id,lesson_session_id' });
  }

  return { success: true };
}

export async function submitLessonRecord(lessonId: string, teacherId: string) {
  const supabase = await createClient();

  // Mark as SUBMITTED and set submitted_at
  const { error } = await supabase
    .from("lesson_sessions")
    .update({
      status: "SUBMITTED",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId)
    .neq("status", "SUBMITTED"); // Double check

  if (error) {
    console.error("Error submitting lesson:", error);
    throw new Error("Failed to submit lesson record.");
  }

  // Log to audit
  await supabase.from("lesson_audit_logs").insert({
    lesson_session_id: lessonId,
    actor_id: teacherId,
    action: "SUBMITTED",
  });

  return { success: true };
}

export async function adminEditLesson(
  lessonId: string,
  adminId: string,
  reason: string,
  payload: {
    status?: LessonStatus;
    summary?: string;
    attendanceUpdates?: { student_id: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }[];
  }
) {
  const supabase = await createClient();

  // Ensure user is an admin/principal (Ideally check role from profiles via DB RLS or here)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", adminId).single();
  if (profile?.role !== 'PRINCIPAL' && profile?.role !== 'MD') {
    throw new Error("Unauthorized to perform admin edits.");
  }

  // Perform updates
  if (payload.status || payload.summary !== undefined) {
    await supabase.from("lesson_sessions").update({
      status: payload.status,
      summary: payload.summary,
      updated_at: new Date().toISOString(),
    }).eq("id", lessonId);
  }

  if (payload.attendanceUpdates && payload.attendanceUpdates.length > 0) {
    const attendanceUpserts = payload.attendanceUpdates.map(a => ({
      lesson_session_id: lessonId,
      student_id: a.student_id,
      status: a.status,
    }));
    await supabase.from("attendance").upsert(attendanceUpserts, { onConflict: 'student_id,lesson_session_id' });
  }

  // Log the admin override
  await supabase.from("lesson_audit_logs").insert({
    lesson_session_id: lessonId,
    actor_id: adminId,
    action: "ADMIN_EDITED",
    reason: reason,
  });

  return { success: true };
}
