"use client";

import { useEffect, useState, useTransition } from "react";

import {
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { createStudent, getStudentDetails } from "@/app/actions/students";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentProfile {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface Student {
  id: string;
  enrollment_no: string;
  program_type: "CERTIFICATE" | "DIPLOMA";
  status: string;
  enrollment_date: string | null;
  profiles: StudentProfile | null;
  class_enrollments?: {
    classes?: {
      courses?: {
        id: string;
        name: string;
        code: string;
      } | null;
    } | null;
  }[];
}

interface StudentsClientProps {
  initialStudents: Student[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load details whenever a student is clicked
  useEffect(() => {
    if (!selectedStudent) {
      setStudentDetails(null);
      return;
    }

    const studentId = selectedStudent.id;

    async function loadDetails() {
      setIsDetailsLoading(true);
      try {
        const data = await getStudentDetails(studentId);
        setStudentDetails(data);
      } catch (err) {
        toast.error("Failed to load student record details.");
        console.error(err);
      } finally {
        setIsDetailsLoading(false);
      }
    }

    loadDetails();
  }, [selectedStudent]);

  // Sync state with server props
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Extract all courses for filter options
  const allCourses = Array.from(
    new Set(
      students.map((s) => s.class_enrollments?.[0]?.classes?.courses?.code).filter(Boolean)
    )
  ) as string[];

  // Filtering Logic
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.profiles?.first_name || ""} ${student.profiles?.last_name || ""}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      student.enrollment_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const programMatch = programFilter === "ALL" || student.program_type === programFilter;
    const statusMatch = statusFilter === "ALL" || student.status === statusFilter;
    const courseCode = student.class_enrollments?.[0]?.classes?.courses?.code;
    const courseMatch = courseFilter === "ALL" || courseCode === courseFilter;

    return searchMatch && programMatch && statusMatch && courseMatch;
  });

  // KPI calculations
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const diplomaCount = students.filter((s) => s.program_type === "DIPLOMA").length;
  const certificateCount = students.filter((s) => s.program_type === "CERTIFICATE").length;

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createStudent(formData);
        toast.success("Student added successfully! Registered in Supabase Auth.");
        setIsAddOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to add student.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Overviews */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Total Enrolled</CardTitle>
            <CardAction>
              <Users className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="font-bold text-3xl tracking-tight">{totalCount}</span>
            <div className="mt-1 text-muted-foreground text-xs">students registered</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Active Roster</CardTitle>
            <CardAction>
              <UserCheck className="size-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="font-bold text-3xl text-emerald-600 tracking-tight dark:text-emerald-400">
              {activeCount}
            </span>
            <div className="mt-1 text-muted-foreground text-xs">
              {totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : 0}% active engagement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Diploma Tracks</CardTitle>
            <CardAction>
              <GraduationCap className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="font-bold text-3xl tracking-tight">{diplomaCount}</span>
            <div className="mt-1 text-muted-foreground text-xs">2-year academic course</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Certificates</CardTitle>
            <CardAction>
              <FileText className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="font-bold text-3xl tracking-tight">{certificateCount}</span>
            <div className="mt-1 text-muted-foreground text-xs">vocational & technical skills</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden text-muted-foreground text-xs sm:inline">Program:</span>
            <NativeSelect
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-[140px] text-sm"
            >
              <option value="ALL">All Programs</option>
              <option value="DIPLOMA">Diploma</option>
              <option value="CERTIFICATE">Certificate</option>
            </NativeSelect>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-muted-foreground text-xs sm:inline">Status:</span>
            <NativeSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[130px] text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </NativeSelect>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-muted-foreground text-xs sm:inline">Course:</span>
            <NativeSelect
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-[130px] text-sm"
            >
              <option value="ALL">All Courses</option>
              {allCourses.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </NativeSelect>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddStudent} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Add Student</DialogTitle>
                  <DialogDescription>
                    Create a student profile and credentials. Default login password is **password123**.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required placeholder="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required placeholder="Smith" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" required placeholder="alex.smith@college.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                    <Input id="enrollmentNo" name="enrollmentNo" required placeholder="STU/2026/004" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" placeholder="+256 700 000000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programType">Program Type</Label>
                  <NativeSelect id="programType" name="programType" required>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="CERTIFICATE">Certificate</option>
                  </NativeSelect>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Registering..." : "Add Student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Students Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Enrollment No.</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrollment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const initials = `${student.profiles?.first_name?.[0] || ""}${student.profiles?.last_name?.[0] || ""}`;
              return (
                <TableRow
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell className="flex items-center gap-3 font-medium">
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">
                        {student.profiles?.first_name} {student.profiles?.last_name}
                      </div>
                      <div className="text-muted-foreground text-xs">{student.profiles?.email || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{student.enrollment_no}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-sm text-xs font-mono">
                      {student.class_enrollments?.[0]?.classes?.courses?.code || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm">
                      {student.program_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"} className="rounded-sm">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="mb-1 h-8 w-8 text-muted-foreground/50" />
                    <span className="font-medium">No students found</span>
                    <span className="text-xs">Try searching a different name or checking filters.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Student Details Sheet */}
      <Sheet open={selectedStudent !== null} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        {selectedStudent && (
          <SheetContent className="overflow-y-auto sm:max-w-[550px]">
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="font-bold text-primary">
                    {selectedStudent.profiles?.first_name?.[0]}
                    {selectedStudent.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl">
                    {selectedStudent.profiles?.first_name} {selectedStudent.profiles?.last_name}
                  </SheetTitle>
                  <SheetDescription className="font-mono text-xs">{selectedStudent.enrollment_no}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Contact Metadata Info Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="truncate font-medium">{selectedStudent.profiles?.email || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Phone className="h-3 w-3" /> Phone
                  </div>
                  <div className="font-medium">{selectedStudent.profiles?.phone || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <GraduationCap className="h-3 w-3" /> Program
                  </div>
                  <div className="font-medium">{selectedStudent.program_type}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" /> Enrolled
                  </div>
                  <div className="font-medium">
                    {selectedStudent.enrollment_date
                      ? new Date(selectedStudent.enrollment_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Details Section */}
              {isDetailsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
                </div>
              ) : studentDetails ? (
                <>
                  {/* Attendance Section */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" /> Recent Attendance
                    </h3>
                    <div className="space-y-2">
                      {studentDetails.attendance.map((att: any) => (
                        <div key={att.id} className="flex items-center justify-between border-b pb-2 text-xs">
                          <div>
                            <p className="font-medium text-foreground">{att.timetable_sessions?.subjects?.name}</p>
                            <p className="text-muted-foreground">{new Date(att.date).toLocaleDateString()}</p>
                          </div>
                          <Badge
                            variant={
                              att.status === "PRESENT"
                                ? "default"
                                : att.status === "ABSENT"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="rounded-sm px-1.5 text-[10px]"
                          >
                            {att.status}
                          </Badge>
                        </div>
                      ))}
                      {studentDetails.attendance.length === 0 && (
                        <p className="rounded border border-dashed py-2 text-center text-muted-foreground text-xs">
                          No attendance records found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Academic Grades Section */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <BookOpen className="h-4 w-4 text-primary" /> Grades & Results
                    </h3>
                    <div className="space-y-2">
                      {studentDetails.results.map((result: any) => (
                        <div key={result.id} className="flex items-center justify-between border-b pb-2 text-xs">
                          <div>
                            <p className="font-medium text-foreground">{result.assessments?.title}</p>
                            <p className="text-muted-foreground">{result.assessments?.subjects?.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground">
                              {result.marks_obtained} / {result.assessments?.total_marks}
                            </span>
                            <Badge variant="outline" className="ml-2 font-semibold">
                              {result.grade || "N/A"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {studentDetails.results.length === 0 && (
                        <p className="rounded border border-dashed py-2 text-center text-muted-foreground text-xs">
                          No assessment records found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Ledger Section */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <FileText className="h-4 w-4 text-primary" /> Fee Invoices
                    </h3>
                    <div className="space-y-2">
                      {studentDetails.invoices.map((inv: any) => {
                        const balance = Number(inv.amount_due) - Number(inv.amount_paid);
                        return (
                          <div key={inv.id} className="flex items-center justify-between border-b pb-2 text-xs">
                            <div>
                              <p className="font-medium text-foreground">
                                Due: {new Date(inv.due_date).toLocaleDateString()}
                              </p>
                              <p className="text-muted-foreground">
                                Total: ${inv.amount_due} · Paid: ${inv.amount_paid}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                              {balance > 0 && (
                                <span className="font-medium text-red-500">${balance.toFixed(2)} due</span>
                              )}
                              <Badge
                                variant={
                                  inv.status === "PAID"
                                    ? "default"
                                    : inv.status === "PARTIAL"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="rounded-sm text-[10px]"
                              >
                                {inv.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {studentDetails.invoices.length === 0 && (
                        <p className="rounded border border-dashed py-2 text-center text-muted-foreground text-xs">
                          No invoices found.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
