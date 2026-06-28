"use client";

import { useState, useTransition } from "react";

import * as Icons from "lucide-react";
import { AlertCircle, Award, BookOpen, Calendar, ClipboardList, Clock, Layers, Plus } from "lucide-react";
import { toast } from "sonner";

import { createSubject, createTopic } from "@/app/actions/academic";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { CourseFormDialog } from "./course-form-dialog";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  duration: string;
  study_times: string;
  icon: string;
}

interface Subject {
  id: string;
  course_id: string;
  name: string;
  code: string;
  credits: number;
}

interface Topic {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface CoursesClientProps {
  courses: Course[];
  subjects: Subject[];
  topics: Topic[];
}

export function CoursesClient({ courses, subjects, topics }: CoursesClientProps) {
  const categories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
  const defaultCategory = categories.length > 0 ? categories[0] : "All";

  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id || null);

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const courseSubjects = subjects.filter((s) => s.course_id === selectedCourseId);

  const filteredCourses = courses.filter((c) => c.category === selectedCategory);

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("courseId", selectedCourseId || "");

    startTransition(async () => {
      try {
        await createSubject(formData);
        toast.success("Subject added to course!");
        setIsSubjectOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to add subject.");
      }
    });
  };

  const handleCreateTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createTopic(formData);
        toast.success("Syllabus topic added successfully!");
        setIsTopicOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to add syllabus topic.");
      }
    });
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || BookOpen;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {categories.length > 0 && (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="scrollbar-hide flex overflow-x-auto pb-2">
            <TabsList className="bg-muted/50 p-1">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="px-4 py-2 text-sm">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const subCount = subjects.filter((s) => s.course_id === course.id).length;
          const totalCreds = subjects
            .filter((s) => s.course_id === course.id)
            .reduce((acc, curr) => acc + (curr.credits || 0), 0);
          const isSelected = selectedCourseId === course.id;

          return (
            <Card
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant={isSelected ? "default" : "secondary"} className="font-mono">
                    {course.code}
                  </Badge>
                  <div
                    className={`rounded-full p-2 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {renderIcon(course.icon)}
                  </div>
                </div>
                <CardTitle className="font-bold text-base leading-tight">{course.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="line-clamp-2 min-h-[2.5rem] text-muted-foreground text-sm">
                  {course.description || "No description provided."}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 rounded-md bg-muted/30 p-1.5 text-muted-foreground text-xs">
                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate" title={course.duration}>
                      {course.duration || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-muted/30 p-1.5 text-muted-foreground text-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate" title={course.study_times}>
                      {course.study_times?.split(",")[0] || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-4 border-border/50 border-t pt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{subCount} Subjects</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{totalCreds} Credits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Course trigger */}
        <Card className="flex h-full min-h-[220px] flex-col items-center justify-center border-2 border-border/60 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground text-sm">Add New Program</p>
            <CourseFormDialog />
          </div>
        </Card>
      </div>

      {/* Course Curriculum & Syllabus details */}
      {selectedCourse && (
        <Card className="mt-8 overflow-hidden border-border/50 shadow-sm">
          <div className="border-b bg-muted/30 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">{renderIcon(selectedCourse.icon)}</div>
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-foreground text-xl">{selectedCourse.name}</h3>
                  <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
                    Manage subject requirements and syllabus modules for this program.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-background">
                      {selectedCourse.duration}
                    </Badge>
                    <Badge variant="outline" className="bg-background">
                      {selectedCourse.study_times}
                    </Badge>
                    <Badge variant="outline" className="border-primary/20 bg-background font-mono text-primary">
                      Code: {selectedCourse.code}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <Dialog open={isSubjectOpen} onOpenChange={setIsSubjectOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="bg-background">
                      <Plus className="mr-1.5 h-4 w-4" /> Subject
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <form onSubmit={handleCreateSubject} className="space-y-4">
                      <DialogHeader>
                        <DialogTitle>Add Subject to {selectedCourse.code}</DialogTitle>
                        <DialogDescription>Insert an individual unit study course.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="code">Subject Code</Label>
                        <Input id="code" name="code" required placeholder="e.g. PLB-101" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Subject Name</Label>
                        <Input id="name" name="name" required placeholder="e.g. Sanitary Installation" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credits">Credit Weight</Label>
                        <Input
                          id="credits"
                          name="credits"
                          type="number"
                          required
                          placeholder="e.g. 4"
                          defaultValue="3"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSubjectOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                          {isPending ? "Saving..." : "Add Subject"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isTopicOpen} onOpenChange={setIsTopicOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" /> Topic
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreateTopic} className="space-y-4">
                      <DialogHeader>
                        <DialogTitle>Add Syllabus Topic</DialogTitle>
                        <DialogDescription>Create a topic node under a specific subject syllabus.</DialogDescription>
                      </DialogHeader>
                      {courseSubjects.length === 0 ? (
                        <div className="py-4 text-center">
                          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
                          <p className="font-medium text-sm">No Subjects Available</p>
                          <p className="mt-1 text-muted-foreground text-xs">
                            Please add a subject to this course first before adding topics.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="subjectId">Select Subject</Label>
                            <NativeSelect id="subjectId" name="subjectId" required>
                              {courseSubjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.name} ({sub.code})
                                </option>
                              ))}
                            </NativeSelect>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title">Topic Title</Label>
                            <Input id="title" name="title" required placeholder="e.g. Pipe Connections & Joining" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Syllabus Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              placeholder="Brief outline of lesson requirements..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orderIndex">Syllabus Sequence Index (Order)</Label>
                            <Input id="orderIndex" name="orderIndex" type="number" required defaultValue="1" />
                          </div>
                        </>
                      )}
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsTopicOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || courseSubjects.length === 0}>
                          {isPending ? "Adding..." : "Add Topic"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {courseSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ClipboardList className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground text-lg">No subjects found</h3>
                <p className="max-w-sm text-muted-foreground text-sm">
                  This course currently has no subjects mapped to it. Click the "Subject" button above to start building
                  the curriculum.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {courseSubjects.map((subject) => {
                  const subjectTopics = topics.filter((t) => t.subject_id === subject.id);
                  return (
                    <AccordionItem
                      key={subject.id}
                      value={subject.id}
                      className="border-t border-b-0 px-6 py-2 first:border-t-0"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex w-full items-center gap-4 pr-4 text-left">
                          <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 font-mono font-semibold text-primary text-xs">
                            {subject.code}
                          </span>
                          <span className="flex-1 font-bold text-base">{subject.name}</span>
                          <Badge variant="outline" className="shrink-0 bg-muted/50 font-medium text-xs">
                            {subject.credits} Credits
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="ml-4 space-y-4 border-border/50 border-l-2 pt-2 pl-6">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Syllabus Topics
                            </h4>
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                              {subjectTopics.length}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            {subjectTopics.map((topic, idx) => (
                              <div
                                key={topic.id}
                                className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/20"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/50 font-bold text-muted-foreground/60 text-sm">
                                  {idx + 1}
                                </span>
                                <div className="space-y-1.5 pt-0.5">
                                  <div className="font-semibold text-foreground text-sm">{topic.title}</div>
                                  {topic.description && (
                                    <p className="text-muted-foreground text-sm leading-relaxed">{topic.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {subjectTopics.length === 0 && (
                              <div className="rounded-xl border-2 border-dashed bg-muted/10 py-6 text-center text-muted-foreground text-sm">
                                No topics scheduled for this subject yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
