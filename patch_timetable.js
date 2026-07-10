import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src/app/(main)/dashboard/school/timetable/_components/timetable-client.tsx");
let content = fs.readFileSync(filePath, "utf8");

// 1. Imports and interfaces
content = content.replace(
  `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClassCohort {
  id: string;
  name: string;
}`,
  `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClassCohort {
  id: string;
  name: string;
  courses?: {
    id: string;
    name: string;
    code: string;
  } | null;
}`,
);

// 2. State & Filtering Logic
content = content.replace(
  `  const [sessions, setSessions] = useState<TimetableSession[]>(initialSessions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sync state
  useState(() => {
    setSessions(initialSessions);
  });`,
  `  const [sessions, setSessions] = useState<TimetableSession[]>(initialSessions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [courseFilter, setCourseFilter] = useState("ALL");

  // Extract all unique courses for the filter dropdown
  const allCourses = Array.from(
    new Map(
      sessions
        .map((s) => s.classes?.courses)
        .filter((c) => c != null)
        .map((c) => [c!.id, c])
    ).values()
  );

  // Filter logic
  const filteredSessions = sessions.filter((session) => {
    if (courseFilter === "ALL") return true;
    return session.classes?.courses?.id === courseFilter;
  });

  // Sync state
  useState(() => {
    setSessions(initialSessions);
  });`,
);

// 3. KPIs
content = content.replace(
  `  // KPIs
  const totalSessions = sessions.length;
  const uniqueRooms = Array.from(new Set(sessions.map((s) => s.room).filter(Boolean))).length;
  const assignedTeachers = Array.from(new Set(sessions.map((s) => s.teacher_id).filter(Boolean))).length;`,
  `  // KPIs
  const totalSessions = filteredSessions.length;
  const uniqueRooms = Array.from(new Set(filteredSessions.map((s) => s.room).filter(Boolean))).length;
  const assignedTeachers = Array.from(new Set(filteredSessions.map((s) => s.teacher_id).filter(Boolean))).length;`,
);

// 4. UI components replacement
content = content.replace(
  `          <TabsList variant="line">
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <Grid3X3 className="h-4 w-4" /> Weekly Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" /> List Layout
            </TabsTrigger>
          </TabsList>

          {/* Add Session Trigger Button */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>`,
  `          <TabsList variant="line">
            <TabsTrigger value="grid" className="flex items-center gap-1">
              <Grid3X3 className="h-4 w-4" /> Weekly Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" /> List Layout
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Course:</span>
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
              <DialogTrigger asChild>`,
);

content = content.replace(
  `                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Weekly Grid View */}`,
  `                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Weekly Grid View */}`,
);

content = content.replace(
  `            {WEEKDAYS.map((dayIndex) => {
              const daySessions = sessions
                .filter((s) => s.day_of_week === dayIndex)`,
  `            {WEEKDAYS.map((dayIndex) => {
              const daySessions = filteredSessions
                .filter((s) => s.day_of_week === dayIndex)`,
);

content = content.replace(
  `              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>`,
  `              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>`,
);

content = content.replace(
  `                {sessions.length === 0 && (
                  <TableRow>`,
  `                {filteredSessions.length === 0 && (
                  <TableRow>`,
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched successfully");
