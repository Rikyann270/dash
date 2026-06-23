"use client";

import { useState, useTransition } from "react";
import { 
  Plus, BookOpen, GraduationCap, FileText, 
  Layers, Award, ClipboardList, Clock, Calendar, AlertCircle
} from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createSubject, createTopic } from "@/app/actions/academic";
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
  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
  const defaultCategory = categories.length > 0 ? categories[0] : "All";
  
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    courses[0]?.id || null
  );

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const courseSubjects = subjects.filter(s => s.course_id === selectedCourseId);

  const filteredCourses = courses.filter(c => c.category === selectedCategory);

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
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-muted/50 p-1">
              {categories.map(cat => (
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
          const subCount = subjects.filter(s => s.course_id === course.id).length;
          const totalCreds = subjects
            .filter(s => s.course_id === course.id)
            .reduce((acc, curr) => acc + (curr.credits || 0), 0);
          const isSelected = selectedCourseId === course.id;

          return (
            <Card 
              key={course.id} 
              onClick={() => setSelectedCourseId(course.id)}
              className={`cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isSelected ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/50'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={isSelected ? 'default' : 'secondary'} className="font-mono">{course.code}</Badge>
                  <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {renderIcon(course.icon)}
                  </div>
                </div>
                <CardTitle className="text-base font-bold leading-tight">{course.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {course.description || "No description provided."}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-1.5 rounded-md">
                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate" title={course.duration}>{course.duration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-1.5 rounded-md">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate" title={course.study_times}>{course.study_times?.split(',')[0] || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 mt-1 text-xs border-t border-border/50">
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
        <Card className="border-2 border-dashed border-border/60 flex flex-col justify-center items-center p-6 text-center hover:bg-muted/30 hover:border-primary/50 transition-colors h-full min-h-[220px]">
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Add New Program</p>
            <CourseFormDialog />
          </div>
        </Card>
      </div>

      {/* Course Curriculum & Syllabus details */}
      {selectedCourse && (
        <Card className="mt-8 border-border/50 shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  {renderIcon(selectedCourse.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    {selectedCourse.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    Manage subject requirements and syllabus modules for this program.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="bg-background">
                      {selectedCourse.duration}
                    </Badge>
                    <Badge variant="outline" className="bg-background">
                      {selectedCourse.study_times}
                    </Badge>
                    <Badge variant="outline" className="bg-background font-mono text-primary border-primary/20">
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
                        <DialogDescription>
                          Insert an individual unit study course.
                        </DialogDescription>
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
                        <Input id="credits" name="credits" type="number" required placeholder="e.g. 4" defaultValue="3" />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSubjectOpen(false)}>Cancel</Button>
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
                        <DialogDescription>
                          Create a topic node under a specific subject syllabus.
                        </DialogDescription>
                      </DialogHeader>
                      {courseSubjects.length === 0 ? (
                        <div className="py-4 text-center">
                          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                          <p className="text-sm font-medium">No Subjects Available</p>
                          <p className="text-xs text-muted-foreground mt-1">Please add a subject to this course first before adding topics.</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="subjectId">Select Subject</Label>
                            <NativeSelect id="subjectId" name="subjectId" required>
                              {courseSubjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                              ))}
                            </NativeSelect>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title">Topic Title</Label>
                            <Input id="title" name="title" required placeholder="e.g. Pipe Connections & Joining" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Syllabus Description</Label>
                            <Textarea id="description" name="description" placeholder="Brief outline of lesson requirements..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orderIndex">Syllabus Sequence Index (Order)</Label>
                            <Input id="orderIndex" name="orderIndex" type="number" required defaultValue="1" />
                          </div>
                        </>
                      )}
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsTopicOpen(false)}>Cancel</Button>
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
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">No subjects found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This course currently has no subjects mapped to it. Click the "Subject" button above to start building the curriculum.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {courseSubjects.map((subject) => {
                  const subjectTopics = topics.filter(t => t.subject_id === subject.id);
                  return (
                    <AccordionItem key={subject.id} value={subject.id} className="border-b-0 border-t first:border-t-0 px-6 py-2">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-4 text-left w-full pr-4">
                          <span className="font-mono text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-md font-semibold shrink-0">
                            {subject.code}
                          </span>
                          <span className="font-bold text-base flex-1">{subject.name}</span>
                          <Badge variant="outline" className="text-xs font-medium shrink-0 bg-muted/50">
                            {subject.credits} Credits
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="pl-6 ml-4 border-l-2 border-border/50 space-y-4 pt-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Syllabus Topics
                            </h4>
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{subjectTopics.length}</Badge>
                          </div>
                          
                          <div className="space-y-3">
                            {subjectTopics.map((topic, idx) => (
                              <div key={topic.id} className="bg-card hover:bg-muted/20 transition-colors p-4 rounded-xl border flex gap-4 items-start shadow-sm">
                                <span className="font-bold text-sm text-muted-foreground/60 bg-muted/50 w-7 h-7 flex items-center justify-center rounded-md shrink-0">
                                  {(idx + 1)}
                                </span>
                                <div className="space-y-1.5 pt-0.5">
                                  <div className="font-semibold text-foreground text-sm">{topic.title}</div>
                                  {topic.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {topic.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {subjectTopics.length === 0 && (
                              <div className="text-sm text-muted-foreground py-6 text-center border-2 border-dashed rounded-xl bg-muted/10">
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
