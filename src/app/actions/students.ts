'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSimpleClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getStudents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      profiles!students_profile_id_fkey(first_name, last_name, email, phone)
    `)
    .order('enrollment_date', { ascending: false })

  if (error) {
    console.error('Error fetching students MESSAGE:', error?.message)
    console.error('Error fetching students DETAILS:', error?.details)
    console.error('Error fetching students HINT:', error?.hint)
    return []
  }
  return data
}

export async function getStudentDetails(studentId: string) {
  const supabase = await createClient()

  const [attendance, invoices, results] = await Promise.all([
    supabase
      .from('attendance')
      .select('*, timetable_sessions(subjects(name))')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .from('fee_invoices')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false }),
    supabase
      .from('results')
      .select('*, assessments(title, total_marks, subjects(name))')
      .eq('student_id', studentId)
  ])

  return {
    attendance: attendance.data || [],
    invoices: invoices.data || [],
    results: results.data || []
  }
}

export async function createStudent(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const programType = formData.get('programType') as string
  const enrollmentNo = formData.get('enrollmentNo') as string
  const phone = formData.get('phone') as string

  if (!firstName || !lastName || !email || !programType || !enrollmentNo) {
    throw new Error('All fields are required.')
  }

  // Create a separate, client-side client to sign up the student.
  // This prevents cookie sessions from logging out the administrator.
  const supabase = createSimpleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let userId: string;
  let useFallback = false;

  try {
    // 1. Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'password123', // Default password
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'STUDENT'
        }
      }
    })

    if (error) {
      console.warn('Auth signUp failed, falling back to direct database insert:', error)
      userId = crypto.randomUUID()
      useFallback = true
    } else if (!data.user) {
      userId = crypto.randomUUID()
      useFallback = true
    } else {
      userId = data.user.id
    }
  } catch (authErr) {
    console.warn('Auth signUp exception, falling back to direct database insert:', authErr)
    userId = crypto.randomUUID()
    useFallback = true
  }

  // 2. Insert into students table using the authenticated server-side client
  const serverSupabase = await createClient()
  
  if (useFallback) {
    const { error: profileError } = await serverSupabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        role: 'STUDENT',
        phone: phone || null
      })

    if (profileError) {
      console.error('Error creating profile fallback:', profileError)
      throw new Error(`Profile Creation Error: ${profileError.message}`)
    }
  } else {
    // Set the phone number on the profile
    await serverSupabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId)
  }

  const { error: studentError } = await serverSupabase
    .from('students')
    .insert([
      {
        profile_id: userId,
        enrollment_no: enrollmentNo,
        program_type: programType,
        status: 'ACTIVE'
      }
    ])

  if (studentError) {
    console.error('Error creating student record:', studentError)
    throw new Error(`Database Error: ${studentError.message}`)
  }

  revalidatePath('/dashboard/school/students')
}

