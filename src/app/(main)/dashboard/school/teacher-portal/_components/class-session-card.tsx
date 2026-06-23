"use client";

import { useState } from "react";
import { Clock, MapPin, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// We will implement the Attendance/Topics forms inside the dialog
import { AttendanceManager } from "./attendance-manager";

export function ClassSessionCard({ session }: { session: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{session.subjects?.name}</CardTitle>
          <Badge variant="secondary">{session.subjects?.code}</Badge>
        </div>
        <CardDescription>{session.classes?.name}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{session.room || 'TBA'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{session.teachers?.profiles?.first_name} {session.teachers?.profiles?.last_name}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Start Session</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Active Session: {session.subjects?.name}</DialogTitle>
              <DialogDescription>
                {session.classes?.name} | {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
              </DialogDescription>
            </DialogHeader>
            
            {/* The main interface for the teacher during the class */}
            <AttendanceManager session={session} />
            
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
