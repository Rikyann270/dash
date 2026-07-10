// using node --env-file
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting to seed Attendance Data...");
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const dateStr = format(today, "yyyy-MM-dd");

  // 1. Ensure we have at least one course and class
  const { data: classes } = await supabase.from("classes").select("id, name");
  if (!classes || classes.length === 0) {
    console.log("No classes found. Please run seed_course_students.js first!");
    return;
  }
  const classId = classes[0].id;
  console.log(`Using class: ${classes[0].name}`);

  // 2. Ensure we have some subjects
  let { data: subjects } = await supabase.from("subjects").select("id, name");
  if (!subjects || subjects.length < 4) {
    console.log("Creating dummy subjects...");
    const newSubjects = [
      { name: "Advanced Mathematics", code: "MAT-301", description: "Advanced Math" },
      { name: "Software Engineering", code: "CS-401", description: "Software Eng" },
      { name: "Database Systems", code: "CS-302", description: "Databases" },
      { name: "Business Communication", code: "BUS-101", description: "Business Comm" },
    ];
    for (const sub of newSubjects) {
      await supabase.from("subjects").insert(sub).select();
    }
    subjects = (await supabase.from("subjects").select("id, name")).data;
  }

  // 3. Ensure we have some teachers
  let { data: teachers } = await supabase.from("teachers").select("id, profile_id, profiles(first_name, last_name)");
  if (!teachers || teachers.length < 4) {
    console.log("Creating dummy teachers...");
    for (let i = 1; i <= 4; i++) {
      const email = `teacher_demo${i}@school.com`;
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: "password123",
        options: {
          data: {
            role: "TEACHER",
            first_name: `Prof${i}`,
            last_name: `Demo`,
          },
        },
      });
      if (authError) {
        console.error(`Failed to sign up ${email}:`, authError.message);
      }

      const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).single();
      if (profile) {
        await supabase.from("teachers").insert({
          profile_id: profile.id,
          department: "Computer Science",
          status: "ACTIVE",
        });
      }
    }
    teachers = (await supabase.from("teachers").select("id, profile_id, profiles(first_name, last_name)")).data;
  }

  // 4. Create Timetable Sessions for TODAY
  console.log("Creating Timetable Sessions for TODAY...");
  const sessionTypes = [
    { start: "08:00:00", end: "10:00:00", type: "PENDING" },
    { start: "10:30:00", end: "12:30:00", type: "IN_PROGRESS" },
    { start: "13:30:00", end: "15:30:00", type: "SUBMITTED" },
    { start: "16:00:00", end: "18:00:00", type: "SKIPPED" },
  ];

  for (let i = 0; i < sessionTypes.length; i++) {
    const sType = sessionTypes[i];
    const teacherId = teachers[i % teachers.length].id;
    const subjectId = subjects[i % subjects.length].id;

    // Create Timetable Session
    const { data: ts, error: tsError } = await supabase
      .from("timetable_sessions")
      .insert({
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
        day_of_week: dayOfWeek,
        start_time: sType.start,
        end_time: sType.end,
        room: `Room ${101 + i}`,
      })
      .select()
      .single();

    if (tsError) {
      console.error("Error creating timetable session:", tsError);
      continue;
    }

    console.log(`Created Timetable Session for ${sType.start} to ${sType.end}`);

    // Create corresponding Lesson Session based on type
    if (sType.type === "PENDING") {
      // Do nothing, no lesson session created
      console.log(` -> Left as PENDING (no lesson session)`);
    } else {
      const statusMap = {
        IN_PROGRESS: "IN_PROGRESS",
        SUBMITTED: "SUBMITTED",
        SKIPPED: "SKIPPED",
      };

      const { data: ls, error: lsError } = await supabase
        .from("lesson_sessions")
        .insert({
          timetable_session_id: ts.id,
          date: dateStr,
          actual_teacher_id: teacherId,
          status: statusMap[sType.type],
          started_at: new Date().toISOString(),
          submitted_at: sType.type === "SUBMITTED" ? new Date().toISOString() : null,
          summary: sType.type === "SUBMITTED" ? "Covered chapter 4 completely. Students were engaged." : null,
        })
        .select()
        .single();

      if (lsError) {
        console.error("Error creating lesson session:", lsError);
        continue;
      }
      console.log(` -> Created Lesson Session with status ${statusMap[sType.type]}`);

      // If submitted, create dummy attendance
      if (sType.type === "SUBMITTED") {
        const { data: students } = await supabase
          .from("class_enrollments")
          .select("student_id")
          .eq("class_id", classId);
        if (students && students.length > 0) {
          const attendanceData = students.map((s, index) => ({
            lesson_session_id: ls.id,
            student_id: s.student_id,
            status: index % 5 === 0 ? "ABSENT" : index % 4 === 0 ? "LATE" : "PRESENT",
          }));
          await supabase.from("attendance").insert(attendanceData);
          console.log(` -> Added attendance for ${students.length} students`);
        }
      }
    }
  }

  console.log("Seeding complete! You can now view the Attendance Command Center.");
}

seed().catch(console.error);
