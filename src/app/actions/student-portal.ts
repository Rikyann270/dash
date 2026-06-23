'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStudentDashboardData() {
  const supabase = await createClient()
  
  // Since we aren't enforcing auth, we will just fetch the first student for demo purposes
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('*, profiles!students_profile_id_fkey(first_name, last_name, email)')
    .limit(1)
    .single()
    
  if (studentError || !studentData) return null
  
  const studentId = studentData.id

  // 1. Fetch student's class cohorts
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_id', studentId)

  const classIds = enrollments?.map((e: any) => e.class_id) || []

  // 2. Fetch timetable, attendance, invoices, results, notifications
  const [timetable, attendance, invoices, results, notifications] = await Promise.all([
    classIds.length > 0 
      ? supabase
          .from('timetable_sessions')
          .select('*, classes(name), subjects(name, code), teachers(profiles(first_name, last_name))')
          .in('class_id', classIds)
          .order('day_of_week')
          .order('start_time')
      : Promise.resolve({ data: [] }),
    supabase
      .from('attendance')
      .select('*, teacher_comments, lesson_sessions(date, summary, homework_assigned, timetable_sessions(subjects(name)), lesson_topics_covered(topic_id, coverage_status, topics(title)))')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('fee_invoices')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false }),
    supabase
      .from('results')
      .select('*, assessments(title, total_marks, subjects(name))')
      .eq('student_id', studentId),
    supabase
      .from('notifications')
      .select('*, teachers(profiles(first_name, last_name))')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20)
  ])

  return {
    student: studentData,
    timetable: timetable.data || [],
    attendance: attendance.data || [],
    invoices: invoices.data || [],
    results: results.data || [],
    notifications: notifications.data || []
  }
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  if (error) throw error
}

export async function markAllNotificationsRead(studentId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('student_id', studentId)
    .eq('is_read', false)
  if (error) throw error
}


