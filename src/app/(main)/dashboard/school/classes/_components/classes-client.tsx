"use client";

import { useState, useTransition } from "react";

import { Calendar, ClipboardList, Info, Layers, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { createClass, enrollStudentInClass } from "@/app/actions/academic";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface ClassCohort {
  id: string;
  name: string;
  course_id: string;
  year: number;
  semester: number;
  courses: { name: string } | null;
}

interface Student {
  id: string;
  enrollment_no: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  students: Student | null;
}

interface ClassesClientProps {
  classes: ClassCohort[];
  courses: Course[];
  students: Student[];
  enrollments: Enrollment[];
}

export function ClassesClient({ classes, courses, students, enrollments }: ClassesClientProps) {
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<ClassCohort | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createClass(formData);
        toast.success("Class cohort created successfully!");
        setIsClassOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to create class.");
      }
    });
  };

  const handleEnrollStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await enrollStudentInClass(formData);
        toast.success("Student enrolled in class cohort!");
        setIsEnrollOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to enroll student.");
      }
    });
  };

  // KPIs
  const totalClassesCount = classes.length;
  const totalEnrollmentsCount = enrollments.length;
  const avgClassSize = totalClassesCount > 0 ? (totalEnrollmentsCount / totalClassesCount).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Overviews */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Active Cohorts</CardTitle>
            <CardAction>
              <Layers className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{totalClassesCount}</span>
            <div className="mt-1 text-muted-foreground text-xs">class sections structured</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Class Placements</CardTitle>
            <CardAction>
              <Users className="size-4 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{totalEnrollmentsCount}</span>
            <div className="mt-1 text-muted-foreground text-xs">total active enrollments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Avg. Section Size</CardTitle>
            <CardAction>
              <Info className="size-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{avgClassSize}</span>
            <div className="mt-1 text-muted-foreground text-xs">students per cohort</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3">
        {/* Enroll Student Dialog */}
        <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <UserPlus className="mr-1.5 h-4 w-4" /> Enroll Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Enroll Student</DialogTitle>
                <DialogDescription>Map a student to a class cohort.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="studentId">Select Student</Label>
                <NativeSelect id="studentId" name="studentId" required>
                  <option value="">-- Choose Student --</option>
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.profiles?.first_name} {std.profiles?.last_name} ({std.enrollment_no})
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classId">Select Cohort (Class)</Label>
                <NativeSelect id="classId" name="classId" required>
                  <option value="">-- Choose Class --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEnrollOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Enrolling..." : "Enroll Student"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Class Dialog */}
        <Dialog open={isClassOpen} onOpenChange={setIsClassOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateClass} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create Class Cohort</DialogTitle>
                <DialogDescription>Setup a group of students attending a curriculum program.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="courseId">Academic Program</Label>
                <NativeSelect id="courseId" name="courseId" required>
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Cohort/Class Name</Label>
                <Input id="name" name="name" required placeholder="e.g. IT Yr 1 Sem 2 - 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" required defaultValue="1" min="1" max="4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input id="semester" name="semester" type="number" required defaultValue="1" min="1" max="3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsClassOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Class"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Cohorts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {classes.map((cohort) => {
          const cohortEnrs = enrollments.filter((e) => e.class_id === cohort.id);
          const studentCount = cohortEnrs.length;

          return (
            <Card
              key={cohort.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedCohort(cohort)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-sm font-mono text-[10px]" variant="secondary">
                    Yr {cohort.year} · Sem {cohort.semester}
                  </Badge>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-2 font-bold text-base">{cohort.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="truncate text-muted-foreground text-xs">
                  {cohort.courses?.name || "Vocational Course"}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t pt-3 font-semibold text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{studentCount} Enrolled Students</span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {classes.length === 0 && (
          <div className="col-span-full rounded-xl border-2 border-dashed py-12 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="font-semibold">No Class Cohorts Configured</p>
            <p className="text-xs">Create a class using the button above to begin enrollment.</p>
          </div>
        )}
      </div>

      {/* Cohort Student Roster Sheet */}
      <Sheet open={selectedCohort !== null} onOpenChange={(open) => !open && setSelectedCohort(null)}>
        {selectedCohort && (
          <SheetContent className="overflow-y-auto sm:max-w-[500px]">
            <SheetHeader className="border-b pb-4">
              <SheetTitle>{selectedCohort.name} Roster</SheetTitle>
              <SheetDescription>
                {selectedCohort.courses?.name} · Year {selectedCohort.year} Semester {selectedCohort.semester}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-6">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Students Enrolled ({enrollments.filter((e) => e.class_id === selectedCohort.id).length})
              </h3>

              <div className="space-y-3">
                {enrollments
                  .filter((e) => e.class_id === selectedCohort.id)
                  .map((e) => {
                    const std = e.students;
                    if (!std) return null;
                    const initials = `${std.profiles?.first_name?.[0] || ""}${std.profiles?.last_name?.[0] || ""}`;

                    return (
                      <div key={e.id} className="flex items-center justify-between border-b pb-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 bg-muted">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {std.profiles?.first_name} {std.profiles?.last_name}
                            </div>
                            <div className="text-muted-foreground text-xs">{std.profiles?.email || "No email"}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {std.enrollment_no}
                        </Badge>
                      </div>
                    );
                  })}

                {enrollments.filter((e) => e.class_id === selectedCohort.id).length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="font-semibold text-xs">No students enrolled</p>
                    <p className="text-[11px]">Enroll a student via the "Enroll Student" option above.</p>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
