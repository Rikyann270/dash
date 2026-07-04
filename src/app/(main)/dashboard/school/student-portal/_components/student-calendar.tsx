"use client";

import * as React from "react";

import { startOfMonth, startOfToday } from "date-fns";
import { enGB } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

interface StudentCalendarProps {
  timetable?: any[];
}

export function StudentCalendar({ timetable = [] }: StudentCalendarProps) {
  const today = startOfToday();
  const [date, setDate] = React.useState<Date | undefined>(today);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(startOfMonth(today));

  const activeDays = React.useMemo(() => {
    return Array.from(new Set(timetable.map((t) => t.day_of_week)));
  }, [timetable]);

  return (
    <Card className="w-full" size="sm">
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          fixedWeeks
          locale={enGB}
          className="w-full p-0"
          modifiers={{ hasClass: { dayOfWeek: activeDays } }}
          modifiersClassNames={{
            hasClass: "bg-primary/10 font-bold text-primary dark:bg-primary/20",
          }}
        />
      </CardContent>
    </Card>
  );
}
