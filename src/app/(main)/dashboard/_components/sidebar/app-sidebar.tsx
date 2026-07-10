"use client";

import Link from "next/link";

import { CircleHelp, ClipboardList, Database, File, Search, Settings } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarSupportCard } from "./sidebar-support-card";

const _data = {
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: CircleHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardList,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: File,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  // biome-ignore lint/suspicious/noExplicitAny: user type from db
  user?: any;
  appRole?: string;
  isDev?: boolean;
};

export function AppSidebar({ user, appRole, isDev, ...props }: AppSidebarProps) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  const filteredItems = sidebarItems
    .filter((group) => !group.devOnly || isDev)
    .filter((group) => !group.roles || !appRole || group.roles.includes(appRole))
    .map((group) => {
      const filteredGroupItems = group.items
        .filter((item) => !item.devOnly || isDev)
        .filter((item) => !item.roles || !appRole || item.roles.includes(appRole))
        .map((item) => {
          if (!item.subItems) return item;
          const filteredSubItems = item.subItems
            .filter((subItem) => !subItem.devOnly || isDev)
            .filter((subItem) => !subItem.roles || !appRole || subItem.roles.includes(appRole));
          return { ...item, subItems: filteredSubItems };
        })
        .filter((item) => !item.subItems || item.subItems.length > 0 || !item.subItems);

      return { ...group, items: filteredGroupItems };
    })
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard/school">
                <img
                  src={APP_CONFIG.logo}
                  alt={APP_CONFIG.shortName}
                  className="size-6 shrink-0 rounded-md object-contain"
                />
                <span className="truncate font-semibold text-base" title={APP_CONFIG.name}>
                  {APP_CONFIG.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSupportCard />
        {user ? <NavUser user={user} /> : <NavUser user={rootUser} />}
      </SidebarFooter>
    </Sidebar>
  );
}
