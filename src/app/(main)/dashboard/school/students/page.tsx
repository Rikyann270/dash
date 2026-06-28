import { getStudents } from "@/app/actions/students";

import { StudentsClient } from "./_components/students-client";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">Students</h1>
        <p className="text-muted-foreground">Manage enrolled students, profiles, and academic records.</p>
      </div>
      <StudentsClient initialStudents={students as any} />
    </div>
  );
}
