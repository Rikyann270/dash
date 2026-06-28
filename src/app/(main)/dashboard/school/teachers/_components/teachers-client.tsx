"use client";

import { useEffect, useState, useTransition } from "react";

import { Award, BookOpen, Calendar, Clock, Mail, Phone, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { createTeacher, getTeacherDetails } from "@/app/actions/teachers";
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

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
        const data = await getTeacherDetails(selectedTeacher?.id);
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
  const specializations = Array.from(new Set(teachers.map((t) => t.specialization).filter(Boolean))) as string[];

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
            <CardTitle className="font-medium text-muted-foreground text-sm">Total Faculty</CardTitle>
            <CardAction>
              <Users className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{teachers.length}</span>
            <div className="mt-1 text-muted-foreground text-xs">staff members employed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Specializations</CardTitle>
            <CardAction>
              <Award className="size-4 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{specializations.length}</span>
            <div className="mt-1 text-muted-foreground text-xs">academic and trade disciplines</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Master Schedules</CardTitle>
            <CardAction>
              <Clock className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">Active</span>
            <div className="mt-1 text-muted-foreground text-xs">all timetables linked</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden text-muted-foreground text-xs sm:inline">Specialty:</span>
            <NativeSelect
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-[180px] text-sm"
            >
              <option value="ALL">All Disciplines</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
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
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
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
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell className="flex items-center gap-3 font-medium">
                    <Avatar className="h-8 w-8 bg-muted">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">
                        {teacher.profiles?.first_name} {teacher.profiles?.last_name}
                      </div>
                      <div className="text-muted-foreground text-xs">{teacher.profiles?.email || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm font-normal">
                      {teacher.specialization || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredTeachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Users className="mb-1 h-8 w-8 text-muted-foreground/50" />
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
          <SheetContent className="overflow-y-auto sm:max-w-[550px]">
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="font-bold text-primary">
                    {selectedTeacher.profiles?.first_name?.[0]}
                    {selectedTeacher.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl">
                    {selectedTeacher.profiles?.first_name} {selectedTeacher.profiles?.last_name}
                  </SheetTitle>
                  <SheetDescription className="font-medium text-primary text-xs">
                    {selectedTeacher.specialization}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Profile Contact Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="truncate font-medium">{selectedTeacher.profiles?.email || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Phone className="h-3 w-3" /> Phone
                  </div>
                  <div className="font-medium">{selectedTeacher.profiles?.phone || "N/A"}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3" /> Date of Hire
                  </div>
                  <div className="font-medium">
                    {selectedTeacher.hire_date ? new Date(selectedTeacher.hire_date).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>

              {/* Dynamic Loading Details Section */}
              {isDetailsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
                </div>
              ) : teacherDetails ? (
                <>
                  {/* Timetable schedule classes */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <Calendar className="h-4 w-4 text-primary" /> Timetable Schedule
                    </h3>
                    <div className="space-y-2">
                      {teacherDetails.timetable.map((session: any) => (
                        <div key={session.id} className="flex items-center justify-between border-b pb-2 text-xs">
                          <div>
                            <p className="font-medium text-foreground">
                              {session.subjects?.name} ({session.subjects?.code})
                            </p>
                            <p className="text-muted-foreground">
                              {session.classes?.name} · Room {session.room || "TBA"}
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-sm">
                            {DAYS_OF_WEEK[session.day_of_week]} {session.start_time.substring(0, 5)} -{" "}
                            {session.end_time.substring(0, 5)}
                          </Badge>
                        </div>
                      ))}
                      {teacherDetails.timetable.length === 0 && (
                        <p className="rounded border border-dashed py-2 text-center text-muted-foreground text-xs">
                          No scheduled classes assigned to this teacher.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Curriculum Lesson Coverage Logs */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <BookOpen className="h-4 w-4 text-primary" /> Recent Lesson Coverages
                    </h3>
                    <div className="space-y-2">
                      {teacherDetails.coverage.map((cov: any) => (
                        <div key={cov.id} className="space-y-1 border-b pb-2 text-xs">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{cov.topics?.title || "Syllabus Topic"}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(cov.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {cov.timetable_sessions?.classes?.name} · {cov.timetable_sessions?.subjects?.name}
                          </p>
                          {cov.notes && (
                            <p className="rounded border-primary border-l-2 bg-muted/40 p-1.5 text-[11px] italic">
                              "{cov.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                      {teacherDetails.coverage.length === 0 && (
                        <p className="rounded border border-dashed py-2 text-center text-muted-foreground text-xs">
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
