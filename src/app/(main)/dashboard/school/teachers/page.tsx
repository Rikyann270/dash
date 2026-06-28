import { getTeachers } from "@/app/actions/teachers";

import { TeachersClient } from "./_components/teachers-client";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">Teachers</h1>
        <p className="text-muted-foreground">Manage academic staff, specializations, and assignments.</p>
      </div>
      <TeachersClient initialTeachers={teachers as any} />
    </div>
  );
}
