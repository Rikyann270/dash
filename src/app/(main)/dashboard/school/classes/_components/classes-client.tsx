"use client";

import { useState, useTransition } from "react";
import { 
  Plus, Calendar, GraduationCap, Users, UserPlus, FileText, 
  Layers, Settings2, Trash2, Award, ClipboardList, CheckCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle 
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClass, enrollStudentInClass } from "@/app/actions/academic";

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cohorts</CardTitle>
            <CardAction>
              <Layers className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight">{totalClassesCount}</span>
            <div className="text-xs text-muted-foreground mt-1">class sections structured</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Class Placements</CardTitle>
            <CardAction>
              <Users className="size-4 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight">{totalEnrollmentsCount}</span>
            <div className="text-xs text-muted-foreground mt-1">total active enrollments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Section Size</CardTitle>
            <CardAction>
              <Info className="size-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight">{avgClassSize}</span>
            <div className="text-xs text-muted-foreground mt-1">students per cohort</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 justify-end">
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
                <DialogDescription>
                  Map a student to a class cohort.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="studentId">Select Student</Label>
                <NativeSelect id="studentId" name="studentId" required>
                  <option value="">-- Choose Student --</option>
                  {students.map(std => (
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
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEnrollOpen(false)}>Cancel</Button>
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
                <DialogDescription>
                  Setup a group of students attending a curriculum program.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="courseId">Academic Program</Label>
                <NativeSelect id="courseId" name="courseId" required>
                  <option value="">-- Select Course --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
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
                <Button type="button" variant="outline" onClick={() => setIsClassOpen(false)}>Cancel</Button>
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
          const cohortEnrs = enrollments.filter(e => e.class_id === cohort.id);
          const studentCount = cohortEnrs.length;

          return (
            <Card 
              key={cohort.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCohort(cohort)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-sm font-mono text-[10px]" variant="secondary">
                    Yr {cohort.year} · Sem {cohort.semester}
                  </Badge>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base mt-2 font-bold">{cohort.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground truncate">
                  {cohort.courses?.name || "Vocational Course"}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t text-sm font-semibold">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{studentCount} Enrolled Students</span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="font-semibold">No Class Cohorts Configured</p>
            <p className="text-xs">Create a class using the button above to begin enrollment.</p>
          </div>
        )}
      </div>

      {/* Cohort Student Roster Sheet */}
      <Sheet open={selectedCohort !== null} onOpenChange={(open) => !open && setSelectedCohort(null)}>
        {selectedCohort && (
          <SheetContent className="sm:max-w-[500px] overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle>{selectedCohort.name} Roster</SheetTitle>
              <SheetDescription>
                {selectedCohort.courses?.name} · Year {selectedCohort.year} Semester {selectedCohort.semester}
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Students Enrolled ({enrollments.filter(e => e.class_id === selectedCohort.id).length})
              </h3>
              
              <div className="space-y-3">
                {enrollments
                  .filter(e => e.class_id === selectedCohort.id)
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
                            <div className="text-xs text-muted-foreground">{std.profiles?.email || "No email"}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">{std.enrollment_no}</Badge>
                      </div>
                    );
                  })}

                {enrollments.filter(e => e.class_id === selectedCohort.id).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
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
