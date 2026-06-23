'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSimpleClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getTeachers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      profiles(first_name, last_name, email, phone)
    `)
    .order('hire_date', { ascending: false })

  if (error) {
    console.error('Error fetching teachers:', error)
    return []
  }
  return data
}

export async function getTeacherDetails(teacherId: string) {
  const supabase = await createClient()

  const [timetable, coverage] = await Promise.all([
    supabase
      .from('timetable_sessions')
      .select('*, classes(name), subjects(name, code)')
      .eq('teacher_id', teacherId)
      .order('day_of_week')
      .order('start_time'),
    supabase
      .from('lesson_coverage')
      .select('*, timetable_sessions(classes(name), subjects(name)), topics(title)')
      .eq('teacher_id', teacherId)
      .order('date', { ascending: false })
      .limit(10)
  ])

  return {
    timetable: timetable.data || [],
    coverage: coverage.data || []
  }
}

export async function createTeacher(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const specialization = formData.get('specialization') as string
  const phone = formData.get('phone') as string

  if (!firstName || !lastName || !email || !specialization) {
    throw new Error('All fields are required.')
  }

  // Standalone client to prevent session cookie override
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let userId: string;
  let useFallback = false;

  try {
    // 1. Try to sign up the user via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'password123', // Default password
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'TEACHER'
        }
      }
    })

    if (error) {
      console.error('Auth signUp failed:', error)
      throw new Error(`Authentication Error: ${error.message}`)
    }
    
    if (!data.user) {
      throw new Error('Authentication Error: User creation failed but no error was returned.')
    }
    
    userId = data.user.id
  } catch (authErr: any) {
    console.error('Auth signUp exception:', authErr)
    throw new Error(authErr.message || 'Failed to create authentication user.')
  }

  const serverSupabase = await createClient()

  // 2. Manage the profile
  if (useFallback) {
    const { error: profileError } = await serverSupabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        role: 'TEACHER',
        phone: phone || null
      })

    if (profileError) {
      console.error('Error creating profile fallback:', profileError)
      throw new Error(`Profile Creation Error: ${profileError.message}`)
    }
  } else {
    // Update the phone number on the profile created by trigger
    await serverSupabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId)
  }

  // 3. Insert into teachers table
  const { error: teacherError } = await serverSupabase
    .from('teachers')
    .insert([
      {
        profile_id: userId,
        specialization: specialization
      }
    ])

  if (teacherError) {
    console.error('Error creating teacher record:', teacherError)
    throw new Error(`Database Error: ${teacherError.message}`)
  }

  revalidatePath('/dashboard/school/teachers')
}

