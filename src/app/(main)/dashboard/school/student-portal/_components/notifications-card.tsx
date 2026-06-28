"use client";

import { useState, useTransition } from "react";

import { Bell, BellOff, BookOpen, CheckCheck, Clock, User } from "lucide-react";
import { toast } from "sonner";

import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/student-portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));

    try {
      await markNotificationRead(id);
    } catch (_error) {
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
      } catch (_error) {
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
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-muted/20 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 font-bold text-base">
            <div className="relative">
              {unreadCount > 0 ? (
                <>
                  <Bell className="h-5 w-5 animate-wiggle text-primary" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                </>
              ) : (
                <Bell className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <span>Updates & Notifications</span>
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="rounded-full bg-primary px-2 py-0 font-semibold text-[10px] text-primary-foreground"
              >
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
              className="flex h-8 items-center gap-1 px-2 text-primary text-xs hover:text-primary/80"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>Updates on your attendance logs and lesson coverage</CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-thin max-h-[380px] overflow-y-auto px-0 pt-4">
        <div className="divide-y divide-border/60">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              className={`flex cursor-pointer gap-3.5 p-4 text-sm transition-all duration-200 ${
                notif.is_read
                  ? "hover:bg-muted/30"
                  : "border-primary border-l-2 bg-primary/5 font-medium hover:bg-primary/10"
              }`}
            >
              <div className="mt-0.5">
                <div
                  className={`rounded-lg p-2 ${notif.is_read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}
                >
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-foreground text-xs">{notif.title}</p>
                  <span className="flex items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(notif.created_at)}
                  </span>
                </div>
                <p className="break-words text-muted-foreground text-xs leading-relaxed">{notif.message}</p>

                {notif.teachers?.profiles && (
                  <div className="flex items-center gap-1 pt-1.5 text-[10px] text-muted-foreground">
                    <User className="h-3 w-3 text-primary/75" />
                    <span>
                      Logged by Prof. {notif.teachers.profiles.first_name} {notif.teachers.profiles.last_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-3 text-muted-foreground/50">
                <BellOff className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm">No new notifications</p>
              <p className="max-w-[200px] text-xs">
                You are all caught up! Updates about marked classes will show up here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
