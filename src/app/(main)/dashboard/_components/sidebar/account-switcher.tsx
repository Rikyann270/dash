"use client";

import { useTransition } from "react";

import { BadgeCheck, Bell, Check, CreditCard, LogOut } from "lucide-react";

import { signOut, switchDevUser } from "@/app/actions/dev-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  appRole?: string;
}

export function AccountSwitcher({
  user,
  devUsers,
  isDev,
}: {
  user: User | null;
  devUsers?: ReadonlyArray<User>;
  isDev?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const displayRole = user.appRole || user.role || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer rounded-lg">
          <AvatarImage src={user.avatar ?? undefined} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar ?? undefined} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="truncate text-xs">{user.email}</span>
              <span className="truncate text-muted-foreground text-xs capitalize">{displayRole}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isDev && devUsers && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Developer Mode (Switch Role)
              </DropdownMenuLabel>
              {devUsers.map((devUser) => (
                <DropdownMenuItem
                  key={devUser.email}
                  className={cn("cursor-pointer p-0")}
                  disabled={isPending}
                  onClick={() => {
                    if (devUser.email && devUser.email !== user.email) {
                      startTransition(async () => {
                        await switchDevUser(devUser.email!);
                      });
                    }
                  }}
                >
                  <div className="flex w-full items-center gap-2 px-1 py-1.5">
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{devUser.name}</span>
                      <span className="truncate text-muted-foreground text-xs capitalize">{devUser.role}</span>
                    </div>
                    {isPending && devUser.email !== user.email ? null : (
                      <span
                        className={cn(
                          "mr-1 flex size-4 items-center justify-center text-primary opacity-0",
                          devUser.email === user.email && "opacity-100",
                        )}
                      >
                        <Check className="size-4" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck className="mr-2 size-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 size-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 size-4" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onClick={() => startTransition(() => signOut())}>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
