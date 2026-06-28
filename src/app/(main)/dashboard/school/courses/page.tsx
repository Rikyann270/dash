import { getCourses, getSubjects } from "@/app/actions/academic";
import { createClient } from "@/lib/supabase/server";

import { CoursesClient } from "./_components/courses-client";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();
  const subjects = await getSubjects();

  const supabase = await createClient();
  const { data: topics } = await supabase.from("topics").select("*").order("order_index");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">Courses & Curriculum</h1>
        <p className="text-muted-foreground">Manage technical programs, core subjects, and syllabus sequences.</p>
      </div>
      <CoursesClient courses={courses as any} subjects={subjects as any} topics={(topics || []) as any} />
    </div>
  );
}
