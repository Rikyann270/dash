'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTimetableSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('timetable_sessions')
    .select(`
      *,
      classes(name),
      subjects(name, code),
      teachers(
        profiles(first_name, last_name)
      )
    `)
    .order('day_of_week')
    .order('start_time')

  if (error) {
    console.error('Error fetching timetable:', error)
    return []
  }
  return data
}

export async function createTimetableSession(formData: FormData) {
  const supabase = await createClient()
  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const teacherId = formData.get('teacherId') as string
  const dayOfWeek = parseInt(formData.get('dayOfWeek') as string)
  const startTime = formData.get('startTime') as string // HH:MM
  const endTime = formData.get('endTime') as string // HH:MM
  const room = formData.get('room') as string

  if (!classId || !subjectId || !teacherId || isNaN(dayOfWeek) || !startTime || !endTime) {
    throw new Error('All timetable fields are required.')
  }

  const { error } = await supabase.from('timetable_sessions').insert([
    {
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId,
      day_of_week: dayOfWeek,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      room
    }
  ])

  if (error) {
    console.error('Error creating timetable session:', error)
    throw error
  }

  revalidatePath('/dashboard/school/timetable')
}

