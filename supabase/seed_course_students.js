// using node --env-file
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Using service role key if available for bypassing RLS, else anon key. For signUp, anon is fine,
// but inserting into classes, students, class_enrollments might require service role if RLS is strict.
// Looking at schema.sql, RLS is currently "Allow full access" on most tables for development.
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Fetching courses...");
  const { data: courses, error: courseError } = await supabase.from("courses").select("*");
  if (courseError) {
    console.error("Error fetching courses:", courseError);
    return;
  }

  console.log(`Found ${courses.length} courses. Populating 10 students each...`);

  for (const course of courses) {
    // Check if class exists for this course
    const { data: classes } = await supabase.from("classes").select("*").eq("course_id", course.id);

    let classRecord;
    if (!classes || classes.length === 0) {
      console.log(`No class found for course ${course.code}. Creating one...`);
      const { data: newClass, error: classError } = await supabase
        .from("classes")
        .insert({
          name: `Class of 2026 - ${course.code}`,
          course_id: course.id,
          year: 2026,
          semester: 1,
        })
        .select()
        .single();

      if (classError) {
        console.error("Error creating class:", classError);
        continue;
      }
      classRecord = newClass;
    } else {
      classRecord = classes[0];
    }

    console.log(`Seeding 10 students for course ${course.code} (Class ID: ${classRecord.id})`);

    for (let i = 1; i <= 10; i++) {
      const email = `stu${i}_${course.code.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.com`;
      const firstName = `${course.code}`;
      const lastName = `Student${i}`;

      // 1. Sign Up User
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: "password123",
        options: {
          data: {
            role: "STUDENT",
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        console.error(`Failed to sign up ${email}:`, authError.message);
        // Continue anyway in case it already exists
      }

      // If authData is available, fetch the newly created profile
      const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).single();

      if (!profile) {
        console.error(`Could not find profile for ${email}`);
        continue;
      }

      // 2. Check if student already exists
      const { data: existingStudent } = await supabase
        .from("students")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      let studentId;
      if (!existingStudent) {
        // Generate enrollment number
        const enrollmentNo = `${course.code}/2026/${String(i).padStart(3, "0")}`;
        const programType = course.category === "Vocational" ? "CERTIFICATE" : "DIPLOMA";

        // Create student
        const { data: newStudent, error: studentError } = await supabase
          .from("students")
          .insert({
            profile_id: profile.id,
            enrollment_no: enrollmentNo,
            program_type: programType,
            status: "ACTIVE",
          })
          .select()
          .single();

        if (studentError) {
          console.error(`Error creating student for ${email}:`, studentError);
          continue;
        }
        studentId = newStudent.id;
      } else {
        studentId = existingStudent.id;
      }

      // 3. Enroll student in the class
      const { error: enrollError } = await supabase.from("class_enrollments").upsert(
        {
          student_id: studentId,
          class_id: classRecord.id,
        },
        { onConflict: "student_id, class_id" },
      );

      if (enrollError) {
        console.error(`Error enrolling ${email}:`, enrollError);
      } else {
        console.log(` Successfully enrolled ${email}`);
      }
    }
  }

  console.log("Population complete.");
}

seed().catch(console.error);
