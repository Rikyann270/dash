"use client";

import { useEffect, useState } from "react";

import { Check, Clock, Edit, Lock, RefreshCw, Send, X } from "lucide-react";
import { toast } from "sonner";

import {
  editNotification,
  getNotificationsForSession,
  getStudentsForClass,
  getTopicsForSubject,
  submitAttendance,
  submitLessonCoverage,
} from "@/app/actions/teacher-portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { initiateLesson, submitLessonRecord } from "@/server/actions/lesson-tracking";

export function AttendanceManager({ session }: { session: any }) {
  const [students, setStudents] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lesson Session State
  const [lessonSessionId, setLessonSessionId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Lesson Coverage State
  const [selectedTopic, setSelectedTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingCoverage, setSubmittingCoverage] = useState(false);

  // Edit Notification State
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  async function loadNotifications() {
    try {
      const data = await getNotificationsForSession(session.id);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const date = new Date().toISOString().split("T")[0];
        // 1. Initialize the Academic Truth Engine lesson session
        const lessonRes = await initiateLesson(session.id, date, session.teacher_id);
        setLessonSessionId(lessonRes.lessonId);
        setIsLocked(lessonRes.isLocked || false);

        // 2. Fetch other required data
        const [studentData, topicsData] = await Promise.all([
          getStudentsForClass(session.class_id),
          getTopicsForSubject(session.subject_id),
        ]);
        setStudents(studentData);
        setTopics(topicsData);
        await loadNotifications();
      } catch (error) {
        toast.error(`Failed to load class data. ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session.class_id, session.subject_id, session.id, session.teacher_id, loadNotifications]);

  const handleAttendance = async (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    if (isLocked) {
      toast.error("This lesson is locked. Only administrators can make changes.");
      return;
    }

    const formData = new FormData();
    formData.append("classId", session.class_id);
    formData.append("sessionId", session.id); // for notifications
    formData.append("lessonSessionId", lessonSessionId!); // for new DB schema
    formData.append("studentId", studentId);
    formData.append("status", status);

    try {
      await submitAttendance(formData);
      toast.success(`Marked as ${status}`);
      await loadNotifications();
    } catch (error: any) {
      toast.error(error.message || "Failed to save attendance");
    }
  };

  const handleCoverageSubmit = async () => {
    if (isLocked) {
      toast.error("This lesson is locked.");
      return;
    }
    if (!selectedTopic) {
      toast.error("Please select a topic covered");
      return;
    }
    setSubmittingCoverage(true);
    try {
      const formData = new FormData();
      formData.append("sessionId", session.id);
      formData.append("lessonSessionId", lessonSessionId!);
      formData.append("topicId", selectedTopic);
      formData.append("teacherId", session.teacher_id);
      formData.append("notes", notes);

      await submitLessonCoverage(formData);
      toast.success("Lesson coverage recorded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to record coverage");
    } finally {
      setSubmittingCoverage(false);
    }
  };

  const handleFinalizeLesson = async () => {
    if (isLocked) return;
    if (!confirm("Are you sure you want to finalize this lesson? You will not be able to edit it afterward.")) return;

    try {
      await submitLessonRecord(lessonSessionId!, session.teacher_id);
      setIsLocked(true);
      toast.success("Lesson record finalized and locked!");
    } catch (error: any) {
      toast.error(error.message || "Failed to finalize lesson.");
    }
  };

  const handleEditClick = (notif: any) => {
    setEditingNotificationId(notif.id);
    setEditTitle(notif.title);
    setEditMessage(notif.message);
  };

  const handleEditCancel = () => {
    setEditingNotificationId(null);
    setEditTitle("");
    setEditMessage("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editMessage) {
      toast.error("Title and message are required");
      return;
    }
    setSubmittingEdit(true);
    try {
      const formData = new FormData();
      formData.append("notificationId", editingNotificationId!);
      formData.append("title", editTitle);
      formData.append("message", editMessage);

      await editNotification(formData);
      toast.success("Notification updated!");
      setEditingNotificationId(null);
      await loadNotifications();
    } catch (_error) {
      toast.error("Failed to update notification");
    } finally {
      setSubmittingEdit(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading Academic Record...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {isLocked && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 font-medium text-destructive text-sm">
          <Lock className="h-4 w-4" />
          This lesson record is SUBMITTED and locked. Only a Principal can edit it.
        </div>
      )}

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="attendance" className="min-w-[100px] flex-1 text-xs sm:text-sm">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="coverage" className="min-w-[100px] flex-1 text-xs sm:text-sm">
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="notifications" className="min-w-[100px] flex-1 text-xs sm:text-sm">
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* TAKE ATTENDANCE TAB */}
        <TabsContent value="attendance" className="pt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Enrollment No.</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.profiles?.first_name} {student.profiles?.last_name}
                    </TableCell>
                    <TableCell>{student.enrollment_no}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked}
                        className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                        onClick={() => handleAttendance(student.id, "PRESENT")}
                      >
                        <Check className="mr-1 h-4 w-4" /> Present
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked}
                        className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        onClick={() => handleAttendance(student.id, "ABSENT")}
                      >
                        <X className="mr-1 h-4 w-4" /> Absent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLocked}
                        className="border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
                        onClick={() => handleAttendance(student.id, "LATE")}
                      >
                        <Clock className="mr-1 h-4 w-4" /> Late
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No students enrolled in this class.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* LESSON COVERAGE TAB */}
        <TabsContent value="coverage" className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="font-medium text-sm">Topic Covered</label>
            <Select disabled={isLocked} value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic from the syllabus" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title}
                  </SelectItem>
                ))}
                {topics.length === 0 && (
                  <SelectItem value="none" disabled>
                    No syllabus topics defined for this subject
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Teacher Notes / Interruptions</label>
            <Textarea
              disabled={isLocked}
              placeholder="Add any notes about student comprehension, or log if the lesson was interrupted..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleCoverageSubmit} disabled={isLocked || submittingCoverage || !selectedTopic}>
            <Send className="mr-2 h-4 w-4" />
            {submittingCoverage ? "Saving..." : "Save Lesson Log"}
          </Button>
        </TabsContent>

        {/* SENT NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs">View or edit notifications dispatched to students.</p>
            <Button variant="outline" size="sm" onClick={loadNotifications} className="h-8 w-8 p-0">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>

          {editingNotificationId ? (
            <form onSubmit={handleEditSubmit} className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <div className="font-bold text-foreground text-sm">Edit Notification</div>
              <div className="space-y-2">
                <label className="font-semibold text-xs">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Notification Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-xs">Message</label>
                <Textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Notification Message"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleEditCancel}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submittingEdit}>
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Message Details</TableHead>
                    <TableHead>Read</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-medium">
                        {notif.students?.profiles?.first_name} {notif.students?.profiles?.last_name}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="font-bold text-foreground text-xs">{notif.title}</div>
                        <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{notif.message}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={notif.is_read ? "secondary" : "default"}
                          className="rounded-sm px-1 py-0 text-[9px]"
                        >
                          {notif.is_read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleEditClick(notif)} className="h-8 px-2">
                          <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {notifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No notifications sent yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!isLocked && (
        <div className="mt-4 flex justify-end border-t pt-4">
          <Button onClick={handleFinalizeLesson} className="bg-primary">
            Finalize Lesson & Lock
          </Button>
        </div>
      )}
    </div>
  );
}
