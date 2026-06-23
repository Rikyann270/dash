"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  Plus, Search, GraduationCap, Users, UserCheck, ShieldAlert,
  Calendar, Phone, Mail, FileText, CheckCircle, Clock, XCircle, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle 
} from "@/components/ui/sheet";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getStudentDetails, createStudent } from "@/app/actions/students";

interface StudentProfile {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface Student {
  id: string;
  enrollment_no: string;
  program_type: 'CERTIFICATE' | 'DIPLOMA';
  status: string;
  enrollment_date: string | null;
  profiles: StudentProfile | null;
}

interface StudentsClientProps {
  initialStudents: Student[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
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

    async function loadDetails() {
      setIsDetailsLoading(true);
      try {
        const data = await getStudentDetails(selectedStudent!.id);
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

  // Filtering Logic
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.profiles?.first_name || ""} ${student.profiles?.last_name || ""}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      student.enrollment_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const programMatch = programFilter === "ALL" || student.program_type === programFilter;
    const statusMatch = statusFilter === "ALL" || student.status === statusFilter;

    return searchMatch && programMatch && statusMatch;
  });

  // KPI calculations
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const diplomaCount = students.filter(s => s.program_type === 'DIPLOMA').length;
  const certificateCount = students.filter(s => s.program_type === 'CERTIFICATE').length;

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrolled</CardTitle>
            <CardAction>
              <Users className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight">{totalCount}</span>
            <div className="text-xs text-muted-foreground mt-1">students registered</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Roster</CardTitle>
            <CardAction>
              <UserCheck className="size-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <div className="text-xs text-muted-foreground mt-1">
              {totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : 0}% active engagement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Diploma Tracks</CardTitle>
            <CardAction>
              <GraduationCap className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight">{diplomaCount}</span>
            <div className="text-xs text-muted-foreground mt-1">2-year academic course</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
            <CardAction>
              <FileText className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col">
            <span className="text-3xl font-bold tracking-tight">{certificateCount}</span>
            <div className="text-xs text-muted-foreground mt-1">vocational & technical skills</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Program:</span>
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
            <span className="text-xs text-muted-foreground hidden sm:inline">Status:</span>
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
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
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
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{student.profiles?.first_name} {student.profiles?.last_name}</div>
                      <div className="text-xs text-muted-foreground">{student.profiles?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{student.enrollment_no}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm">
                      {student.program_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-sm">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="h-8 w-8 text-muted-foreground/50 mb-1" />
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
          <SheetContent className="sm:max-w-[550px] overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary font-bold">
                    {selectedStudent.profiles?.first_name?.[0]}{selectedStudent.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl">
                    {selectedStudent.profiles?.first_name} {selectedStudent.profiles?.last_name}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-mono">{selectedStudent.enrollment_no}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Contact Metadata Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="font-medium truncate">{selectedStudent.profiles?.email || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </div>
                  <div className="font-medium">{selectedStudent.profiles?.phone || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> Program
                  </div>
                  <div className="font-medium">{selectedStudent.program_type}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Enrolled
                  </div>
                  <div className="font-medium">
                    {selectedStudent.enrollment_date ? new Date(selectedStudent.enrollment_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Details Section */}
              {isDetailsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : studentDetails ? (
                <>
                  {/* Attendance Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" /> Recent Attendance
                    </h3>
                    <div className="space-y-2">
                      {studentDetails.attendance.map((att: any) => (
                        <div key={att.id} className="flex items-center justify-between text-xs border-b pb-2">
                          <div>
                            <p className="font-medium text-foreground">{att.timetable_sessions?.subjects?.name}</p>
                            <p className="text-muted-foreground">{new Date(att.date).toLocaleDateString()}</p>
                          </div>
                          <Badge 
                            variant={att.status === 'PRESENT' ? 'default' : att.status === 'ABSENT' ? 'destructive' : 'secondary'}
                            className="rounded-sm text-[10px] px-1.5"
                          >
                            {att.status}
                          </Badge>
                        </div>
                      ))}
                      {studentDetails.attendance.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded">
                          No attendance records found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Academic Grades Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <BookOpen className="h-4 w-4 text-primary" /> Grades & Results
                    </h3>
                    <div className="space-y-2">
                      {studentDetails.results.map((result: any) => (
                        <div key={result.id} className="flex items-center justify-between text-xs border-b pb-2">
                          <div>
                            <p className="font-medium text-foreground">{result.assessments?.title}</p>
                            <p className="text-muted-foreground">{result.assessments?.subjects?.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground">
                              {result.marks_obtained} / {result.assessments?.total_marks}
                            </span>
                            <Badge variant="outline" className="ml-2 font-semibold">
                              {result.grade || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {studentDetails.results.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded">
                          No assessment records found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Ledger Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <FileText className="h-4 w-4 text-primary" /> Fee Invoices
                    </h3>
                    <div className="space-y-2">
                      {studentDetails.invoices.map((inv: any) => {
                        const balance = Number(inv.amount_due) - Number(inv.amount_paid);
                        return (
                          <div key={inv.id} className="flex items-center justify-between text-xs border-b pb-2">
                            <div>
                              <p className="font-medium text-foreground">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                              <p className="text-muted-foreground">
                                Total: ${inv.amount_due} · Paid: ${inv.amount_paid}
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              {balance > 0 && <span className="text-red-500 font-medium">${balance.toFixed(2)} due</span>}
                              <Badge 
                                variant={inv.status === 'PAID' ? 'default' : inv.status === 'PARTIAL' ? 'secondary' : 'destructive'}
                                className="rounded-sm text-[10px]"
                              >
                                {inv.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {studentDetails.invoices.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded">
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
