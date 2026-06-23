"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  Plus, Search, GraduationCap, Users, UserCheck, Phone, Mail, 
  Calendar, Award, BookOpen, Clock, FileText, CheckCircle
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
import { getTeacherDetails, createTeacher } from "@/app/actions/teachers";

interface TeacherProfile {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface Teacher {
  id: string;
  specialization: string | null;
  hire_date: string | null;
  profiles: TeacherProfile | null;
}

interface TeachersClientProps {
  initialTeachers: Teacher[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TeachersClient({ initialTeachers }: TeachersClientProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("ALL");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load dynamic details on click
  useEffect(() => {
    if (!selectedTeacher) {
      setTeacherDetails(null);
      return;
    }

    async function loadDetails() {
      setIsDetailsLoading(true);
      try {
        const data = await getTeacherDetails(selectedTeacher!.id);
        setTeacherDetails(data);
      } catch (err) {
        toast.error("Failed to load teacher schedule details.");
        console.error(err);
      } finally {
        setIsDetailsLoading(false);
      }
    }

    loadDetails();
  }, [selectedTeacher]);

  // Sync state
  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  // Extract all specializations for filter options
  const specializations = Array.from(
    new Set(teachers.map(t => t.specialization).filter(Boolean))
  ) as string[];

  // Filter logic
  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.profiles?.first_name || ""} ${teacher.profiles?.last_name || ""}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      (teacher.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.specialization || "").toLowerCase().includes(searchTerm.toLowerCase());

    const specMatch = specializationFilter === "ALL" || teacher.specialization === specializationFilter;

    return searchMatch && specMatch;
  });

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createTeacher(formData);
        toast.success("Teacher added successfully! Registered in Supabase Auth.");
        setIsAddOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to add teacher.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Faculty</CardTitle>
            <CardAction>
              <Users className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight">{teachers.length}</span>
            <div className="text-xs text-muted-foreground mt-1">staff members employed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Specializations</CardTitle>
            <CardAction>
              <Award className="size-4 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight">{specializations.length}</span>
            <div className="text-xs text-muted-foreground mt-1">academic and trade disciplines</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Master Schedules</CardTitle>
            <CardAction>
              <Clock className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tracking-tight">Active</span>
            <div className="text-xs text-muted-foreground mt-1">all timetables linked</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teachers..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Specialty:</span>
            <NativeSelect 
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-[180px] text-sm"
            >
              <option value="ALL">All Disciplines</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </NativeSelect>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Add Teacher</DialogTitle>
                  <DialogDescription>
                    Create a faculty profile. Default login password is **password123**.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required placeholder="Mugisha" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" required placeholder="john.mugisha@college.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="+256 772 000000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization / Department</Label>
                  <Input id="specialization" name="specialization" required placeholder="e.g. Electrical Engineering" />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Registering..." : "Add Teacher"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Teachers Table Grid */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Hire Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => {
              const initials = `${teacher.profiles?.first_name?.[0] || ""}${teacher.profiles?.last_name?.[0] || ""}`;
              return (
                <TableRow 
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{teacher.profiles?.first_name} {teacher.profiles?.last_name}</div>
                      <div className="text-xs text-muted-foreground">{teacher.profiles?.email || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm font-normal">
                      {teacher.specialization || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredTeachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-48 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="h-8 w-8 text-muted-foreground/50 mb-1" />
                    <span className="font-medium">No teachers found</span>
                    <span className="text-xs">Try searching a different name.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Teacher Details Sheet */}
      <Sheet open={selectedTeacher !== null} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        {selectedTeacher && (
          <SheetContent className="sm:max-w-[550px] overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary font-bold">
                    {selectedTeacher.profiles?.first_name?.[0]}{selectedTeacher.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl">
                    {selectedTeacher.profiles?.first_name} {selectedTeacher.profiles?.last_name}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-medium text-primary">
                    {selectedTeacher.specialization}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Profile Contact Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="font-medium truncate">{selectedTeacher.profiles?.email || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </div>
                  <div className="font-medium">{selectedTeacher.profiles?.phone || 'N/A'}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date of Hire
                  </div>
                  <div className="font-medium">
                    {selectedTeacher.hire_date ? new Date(selectedTeacher.hire_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Details Section */}
              {isDetailsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : teacherDetails ? (
                <>
                  {/* Timetable schedule classes */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <Calendar className="h-4 w-4 text-primary" /> Timetable Schedule
                    </h3>
                    <div className="space-y-2">
                      {teacherDetails.timetable.map((session: any) => (
                        <div key={session.id} className="flex items-center justify-between text-xs border-b pb-2">
                          <div>
                            <p className="font-medium text-foreground">{session.subjects?.name} ({session.subjects?.code})</p>
                            <p className="text-muted-foreground">{session.classes?.name} · Room {session.room || 'TBA'}</p>
                          </div>
                          <Badge variant="outline" className="rounded-sm">
                            {DAYS_OF_WEEK[session.day_of_week]} {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                          </Badge>
                        </div>
                      ))}
                      {teacherDetails.timetable.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded">
                          No scheduled classes assigned to this teacher.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Curriculum Lesson Coverage Logs */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                      <BookOpen className="h-4 w-4 text-primary" /> Recent Lesson Coverages
                    </h3>
                    <div className="space-y-2">
                      {teacherDetails.coverage.map((cov: any) => (
                        <div key={cov.id} className="space-y-1 text-xs border-b pb-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{cov.topics?.title || 'Syllabus Topic'}</p>
                            <p className="text-muted-foreground text-[10px]">{new Date(cov.date).toLocaleDateString()}</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{cov.timetable_sessions?.classes?.name} · {cov.timetable_sessions?.subjects?.name}</p>
                          {cov.notes && (
                            <p className="text-[11px] bg-muted/40 p-1.5 rounded italic border-l-2 border-primary">
                              "{cov.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                      {teacherDetails.coverage.length === 0 && (
                        <p className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded">
                          No curriculum lesson progress recorded yet.
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
