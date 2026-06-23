import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, GraduationCap, BookOpen, Banknote, Calendar, 
  TrendingUp, Award, Layers, Clock, ShieldAlert 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const dynamic = 'force-dynamic';

export default async function SchoolDashboardOverview() {
  const supabase = await createClient();

  // 1. Gather all statistics concurrently
  const [
    { count: studentsCount },
    { count: teachersCount },
    { count: coursesCount },
    { data: invoices },
    { data: coverage }
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("fee_invoices").select("amount_due, amount_paid"),
    supabase.from("lesson_sessions")
      .select("*, teachers:actual_teacher_id(profiles(first_name, last_name)), timetable_sessions(classes(name), subjects(name))")
      .order("updated_at", { ascending: false })
      .limit(10)
  ]);

  // 2. Financial computations
  const totalBilled = invoices?.reduce((acc, curr) => acc + Number(curr.amount_due), 0) || 0;
  const totalPaid = invoices?.reduce((acc, curr) => acc + Number(curr.amount_paid), 0) || 0;
  const collectionRate = totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(0) : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Institution Overview</h1>
        <p className="text-muted-foreground text-sm">
          Vocational and technical campus overview dashboard.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Students</CardTitle>
            <CardAction>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">active technical trainees</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Faculty Staff</CardTitle>
            <CardAction>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachersCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">instructors & trade trainers</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Programs Offered</CardTitle>
            <CardAction>
              <Layers className="h-4 w-4 text-primary" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">diplomas & certificate tracks</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Fee Collections</CardTitle>
            <CardAction>
              <Banknote className="h-4 w-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalPaid.toLocaleString()} of ${totalBilled.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Finance and Curriculum logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 w-full">
        {/* Recent Lesson Coverages Log */}
        {/* Academic Accountability Feed */}
        <div className="lg:col-span-7 w-full min-w-0">
          <Card className="h-full">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" /> Academic Truth Engine - Live Feed
            </CardTitle>
            <CardDescription>Real-time verification of teaching activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {coverage?.map((log: any) => {
                const isSubmitted = log.status === 'SUBMITTED';
                const isMissing = log.status === 'SCHEDULED' || log.status === 'SKIPPED';
                
                return (
                  <div key={log.id} className="flex items-start gap-3 border-b pb-3 text-sm">
                    <Avatar className={`h-8 w-8 mt-0.5 ${isMissing ? 'bg-destructive/10' : 'bg-muted'}`}>
                      <AvatarFallback className={`text-[10px] font-bold ${isMissing ? 'text-destructive' : ''}`}>
                        {log.teachers?.profiles?.first_name?.[0]}{log.teachers?.profiles?.last_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground flex items-center gap-2">
                          {log.teachers?.profiles?.first_name} {log.teachers?.profiles?.last_name || 'Unassigned'}
                          <Badge variant={isSubmitted ? "default" : isMissing ? "destructive" : "secondary"} className="text-[9px] px-1 py-0 h-4">
                            {log.status}
                          </Badge>
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.timetable_sessions?.subjects?.name} <span className="mx-1 opacity-50">•</span> {log.timetable_sessions?.classes?.name}
                      </p>
                      
                      {isSubmitted && (
                        <div className="text-xs italic bg-muted/30 p-2 rounded border-l-2 border-primary mt-2 text-muted-foreground">
                          <span className="block font-semibold not-italic mb-1">Teacher Summary:</span>
                          "{log.summary || 'No summary provided'}"
                        </div>
                      )}
                      
                      {log.issues_interruptions && (
                        <div className="text-xs bg-yellow-500/10 p-2 rounded border-l-2 border-yellow-500 mt-1 text-yellow-700 dark:text-yellow-500">
                          <span className="block font-semibold mb-1">Interruptions Logged:</span>
                          {log.issues_interruptions}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!coverage || coverage.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No verifiable teaching logs recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Institution Highlights Info card */}
        <div className="lg:col-span-5 w-full min-w-0">
          <Card className="flex flex-col justify-between h-full">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Academic Quick Links
            </CardTitle>
            <CardDescription>Shortcut widgets for administration</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border text-sm">
                <span className="font-medium text-foreground">Curriculum Maps</span>
                <Badge variant="outline">Updated</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border text-sm">
                <span className="font-medium text-foreground">Timetable Loads</span>
                <Badge variant="outline">Balanced</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border text-sm border-emerald-500/20 bg-emerald-500/5">
                <span className="font-medium text-foreground">Registration Status</span>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Open</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
