"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, CheckCheck, Clock, MessageSquare, BookOpen, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/student-portal";

interface Notification {
  id: string;
  student_id: string;
  teacher_id: string | null;
  timetable_session_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  teachers: {
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

interface NotificationsCardProps {
  initialNotifications: Notification[];
  studentId: string;
}

export function NotificationsCard({ initialNotifications, studentId }: NotificationsCardProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await markNotificationRead(id);
    } catch (error) {
      toast.error("Failed to update notification");
      // Revert if error
      setNotifications(initialNotifications);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    startTransition(async () => {
      try {
        await markAllNotificationsRead(studentId);
        toast.success("All notifications marked as read");
      } catch (error) {
        toast.error("Failed to update notifications");
        setNotifications(initialNotifications);
      }
    });
  };

  // Helper to get time elapsed
  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-muted/20 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2.5">
            <div className="relative">
              {unreadCount > 0 ? (
                <>
                  <Bell className="h-5 w-5 text-primary animate-wiggle" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                </>
              ) : (
                <Bell className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <span>Updates & Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full px-2 py-0 text-[10px] bg-primary text-primary-foreground font-semibold">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="text-xs text-primary hover:text-primary/80 h-8 px-2 flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>Updates on your attendance logs and lesson coverage</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-0 max-h-[380px] overflow-y-auto scrollbar-thin">
        <div className="divide-y divide-border/60">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              className={`p-4 transition-all duration-200 cursor-pointer flex gap-3.5 text-sm ${
                notif.is_read
                  ? "hover:bg-muted/30"
                  : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary font-medium"
              }`}
            >
              <div className="mt-0.5">
                <div className={`p-2 rounded-lg ${notif.is_read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground text-xs truncate">{notif.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed break-words">{notif.message}</p>
                
                {notif.teachers?.profiles && (
                  <div className="flex items-center gap-1 pt-1.5 text-[10px] text-muted-foreground">
                    <User className="h-3 w-3 text-primary/75" />
                    <span>Logged by Prof. {notif.teachers.profiles.first_name} {notif.teachers.profiles.last_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-muted rounded-full text-muted-foreground/50">
                <BellOff className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm">No new notifications</p>
              <p className="text-xs max-w-[200px]">You are all caught up! Updates about marked classes will show up here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
