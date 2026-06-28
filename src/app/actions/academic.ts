"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function getCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const duration = formData.get("duration") as string;
  const studyTimes = formData.get("studyTimes") as string;
  const icon = formData.get("icon") as string;

  if (!name || !code) throw new Error("Name and Code are required.");

  const { error } = await supabase.from("courses").insert([
    {
      name,
      code,
      description,
      category,
      duration,
      study_times: studyTimes,
      icon,
    },
  ]);
  if (error) throw error;

  revalidatePath("/dashboard/school/courses");
}

export async function getSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("*, courses(name)").order("name");
  if (error) throw error;
  return data;
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient();
  const courseId = formData.get("courseId") as string;
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const credits = parseInt((formData.get("credits") as string) || "3", 10);

  if (!courseId || !name || !code) throw new Error("Course, Name, and Code are required.");

  const { error } = await supabase.from("subjects").insert([{ course_id: courseId, name, code, credits }]);
  if (error) throw error;

  revalidatePath("/dashboard/school/courses");
}

export async function getClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("*, courses(name)").order("name");
  if (error) throw error;
  return data;
}

export async function createClass(formData: FormData) {
  const supabase = await createClient();
  const courseId = formData.get("courseId") as string;
  const name = formData.get("name") as string;
  const year = parseInt(formData.get("year") as string, 10);
  const semester = parseInt(formData.get("semester") as string, 10);

  if (!courseId || !name || !year || !semester) throw new Error("Course, Name, Year, and Semester are required.");

  const { error } = await supabase.from("classes").insert([{ course_id: courseId, name, year, semester }]);
  if (error) throw error;

  revalidatePath("/dashboard/school/classes");
}

export async function createTopic(formData: FormData) {
  const supabase = await createClient();
  const subjectId = formData.get("subjectId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const orderIndex = parseInt((formData.get("orderIndex") as string) || "0", 10);

  if (!subjectId || !title) throw new Error("Subject and Title are required.");

  const { error } = await supabase
    .from("topics")
    .insert([{ subject_id: subjectId, title, description, order_index: orderIndex }]);
  if (error) throw error;

  revalidatePath("/dashboard/school/courses");
}

export async function enrollStudentInClass(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("studentId") as string;
  const classId = formData.get("classId") as string;

  if (!studentId || !classId) throw new Error("Student and Class are required.");

  const { error } = await supabase.from("class_enrollments").insert([{ student_id: studentId, class_id: classId }]);
  if (error && error.code !== "23505") {
    // Ignore unique constraint violation (already enrolled)
    throw error;
  }

  revalidatePath("/dashboard/school/classes");
  revalidatePath("/dashboard/school/students");
}
