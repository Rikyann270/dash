import { getClasses, getCourses } from "@/app/actions/academic";
import { getStudents } from "@/app/actions/students";
import { createClient } from "@/lib/supabase/server";

import { ClassesClient } from "./_components/classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const [classes, courses, students] = await Promise.all([getClasses(), getCourses(), getStudents()]);

  const supabase = await createClient();
  const { data: enrollments } = await supabase.from("class_enrollments").select(`
      id,
      student_id,
      class_id,
      students (
        id,
        enrollment_no,
        profiles (
          first_name,
          last_name,
          email
        )
      )
    `);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">Classes & Cohorts</h1>
        <p className="text-muted-foreground">Manage active student sections, cohorts, and class placements.</p>
      </div>
      <ClassesClient
        classes={classes as any}
        courses={courses as any}
        students={students as any}
        enrollments={(enrollments || []) as any}
      />
    </div>
  );
}
