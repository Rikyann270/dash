"use client";

import { useState, useTransition } from "react";

import { Calendar, Clock, Grid3X3, List, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { createTimetableSession } from "@/app/actions/timetable";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClassCohort {
  id: string;
  name: string;
  courses?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TimetableSession {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  classes: ClassCohort | null;
  subjects: Subject | null;
  teachers: Teacher | null;
}

interface TimetableClientProps {
  initialSessions: TimetableSession[];
  classes: ClassCohort[];
  subjects: Subject[];
  teachers: Teacher[];
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon to Fri

export function TimetableClient({ initialSessions, classes, subjects, teachers }: TimetableClientProps) {
  const [sessions, setSessions] = useState<TimetableSession[]>(initialSessions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [courseFilter, setCourseFilter] = useState("ALL");

  // Extract all unique courses for the filter dropdown
  const allCourses = Array.from(
    new Map(
      sessions
        .map((s) => s.classes?.courses)
        .filter((c) => c != null)
        .map((c) => [c?.id, c]),
    ).values(),
  );

  // Filter logic
  const filteredSessions = sessions.filter((session) => {
    if (courseFilter === "ALL") return true;
    return session.classes?.courses?.id === courseFilter;
  });

  // Sync state
  useState(() => {
    setSessions(initialSessions);
  });

  const handleAddSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createTimetableSession(formData);
        toast.success("Timetable session scheduled successfully!");
        setIsAddOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to schedule session.");
      }
    });
  };

  // KPIs
  const totalSessions = filteredSessions.length;
  const uniqueRooms = Array.from(new Set(filteredSessions.map((s) => s.room).filter(Boolean))).length;
  const assignedTeachers = Array.from(new Set(filteredSessions.map((s) => s.teacher_id).filter(Boolean))).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Scheduled Classes</CardTitle>
            <CardAction>
              <Calendar className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{totalSessions}</span>
            <div className="mt-1 text-muted-foreground text-xs">active blocks scheduled weekly</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Assigned Rooms</CardTitle>
            <CardAction>
              <MapPin className="size-4 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{uniqueRooms}</span>
            <div className="mt-1 text-muted-foreground text-xs">laboratories & workshops used</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Active Faculty</CardTitle>
            <CardAction>
              <Users className="size-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">{assignedTeachers}</span>
            <div className="mt-1 text-muted-foreground text-xs">teachers assigned sections</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grid" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList variant="line">
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <Grid3X3 className="h-4 w-4" /> Weekly Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" /> List Layout
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden text-muted-foreground text-sm sm:inline">Course:</span>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courses</SelectItem>
                  {allCourses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Session Trigger Button */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" /> Add Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleAddSession} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Add Timetable Session</DialogTitle>
                    <DialogDescription>
                      Schedule a class period, assigning a subject, teacher, and room.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class Cohort</Label>
                    <NativeSelect id="classId" name="classId" required>
                      <option value="">-- Select Class --</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Subject</Label>
                    <NativeSelect id="subjectId" name="subjectId" required>
                      <option value="">-- Select Subject --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Responsible Teacher</Label>
                    <NativeSelect id="teacherId" name="teacherId" required>
                      <option value="">-- Select Teacher --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.profiles?.first_name} {t.profiles?.last_name}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dayOfWeek">Day</Label>
                      <NativeSelect id="dayOfWeek" name="dayOfWeek" required>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                      </NativeSelect>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room">Room / Location</Label>
                      <Input id="room" name="room" required placeholder="e.g. Lab 2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input id="startTime" name="startTime" type="time" required defaultValue="09:00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input id="endTime" name="endTime" type="time" required defaultValue="11:00" />
                    </div>
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Scheduling..." : "Schedule Session"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Weekly Grid View */}
        <TabsContent value="grid">
          <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-5">
            {WEEKDAYS.map((dayIndex) => {
              const daySessions = filteredSessions
                .filter((s) => s.day_of_week === dayIndex)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));

              return (
                <div key={dayIndex} className="space-y-4">
                  <div className="rounded-lg border bg-muted p-2.5 text-center font-bold text-muted-foreground text-xs uppercase tracking-wider">
                    {DAYS_OF_WEEK[dayIndex]}
                  </div>

                  <div className="min-h-[300px] space-y-3">
                    {daySessions.map((session) => {
                      const _initials = `${session.teachers?.profiles?.first_name?.[0] || ""}${session.teachers?.profiles?.last_name?.[0] || ""}`;
                      return (
                        <div
                          key={session.id}
                          className="relative flex flex-col gap-2.5 rounded-lg border-2 border-primary/10 bg-card p-3 shadow-sm transition-all hover:border-primary/30"
                        >
                          <div>
                            <span className="rounded bg-primary/5 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-primary">
                              {session.subjects?.code}
                            </span>
                            <h4 className="mt-1.5 line-clamp-2 font-bold text-xs">{session.subjects?.name}</h4>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>Room: {session.room || "TBA"}</span>
                          </div>

                          <div className="flex items-center justify-between border-t pt-2 text-[11px]">
                            <span className="max-w-[100px] truncate font-medium text-foreground">
                              {session.teachers?.profiles?.first_name} {session.teachers?.profiles?.last_name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {session.classes?.name.split(" ")[0]}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {daySessions.length === 0 && (
                      <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 py-12 text-center text-[10px] text-muted-foreground/40">
                        <Clock className="mb-1 h-5 w-5 opacity-50" />
                        <span>No classes scheduled</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List Layout View */}
        <TabsContent value="list">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time Block</TableHead>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Cohort Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Room</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-bold">{DAYS_OF_WEEK[session.day_of_week]}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-sm font-mono">
                        {session.subjects?.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{session.subjects?.name}</TableCell>
                    <TableCell>{session.classes?.name}</TableCell>
                    <TableCell>
                      {session.teachers?.profiles?.first_name} {session.teachers?.profiles?.last_name}
                    </TableCell>
                    <TableCell className="font-mono">{session.room || "TBA"}</TableCell>
                  </TableRow>
                ))}

                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No scheduled timetable sessions.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
