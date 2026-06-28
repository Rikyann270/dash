import {
  Banknote,
  BookOpenCheck,
  Calendar,
  ChartBar,
  Fingerprint,
  Forklift,
  Gauge,
  GraduationCap,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
  ReceiptText,
  ShoppingBag,
  SquareArrowUpRight,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: string[];
  devOnly?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: string[];
  devOnly?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
  roles?: string[];
  devOnly?: boolean;
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    devOnly: true,
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        title: "Productivity",
        url: "/dashboard/productivity",
        icon: ListTodo,
      },
      {
        title: "E-commerce",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
      },
      {
        title: "Academy",
        url: "/dashboard/academy",
        icon: GraduationCap,
        isNew: true,
      },
      {
        title: "Logistics",
        url: "/dashboard/logistics",
        icon: Forklift,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    devOnly: true,
    items: [
      {
        title: "Email",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        title: "Kanban",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
      {
        title: "Invoice",
        url: "/dashboard/invoice",
        icon: ReceiptText,
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Roles",
        url: "/dashboard/roles",
        icon: Lock,
      },
      {
        title: "Authentication",
        url: "/auth",
        icon: Fingerprint,
        subItems: [
          { title: "Login v1", url: "/auth/v1/login", newTab: true },
          { title: "Login v2", url: "/auth/v2/login", newTab: true },
          { title: "Register v1", url: "/auth/v1/register", newTab: true },
          { title: "Register v2", url: "/auth/v2/register", newTab: true },
        ],
      },
    ],
  },
  {
    id: 5,
    label: "School Management",
    items: [
      {
        title: "Overview",
        url: "/dashboard/school",
        icon: LayoutDashboard,
        roles: ["MD", "PRINCIPAL"],
      },
      {
        title: "Students",
        url: "/dashboard/school/students",
        icon: Users,
        roles: ["MD", "PRINCIPAL"],
      },
      {
        title: "Teachers",
        url: "/dashboard/school/teachers",
        icon: GraduationCap,
        roles: ["MD", "PRINCIPAL"],
      },
      {
        title: "Courses",
        url: "/dashboard/school/courses",
        icon: BookOpenCheck,
        roles: ["MD", "PRINCIPAL"],
      },
      {
        title: "Classes",
        url: "/dashboard/school/classes",
        icon: Calendar,
        roles: ["MD", "PRINCIPAL"],
      },
      {
        title: "Timetable",
        url: "/dashboard/school/timetable",
        icon: Calendar,
      },
      {
        title: "Teacher Portal",
        url: "/dashboard/school/teacher-portal",
        icon: ListTodo,
        roles: ["TEACHER", "MD", "PRINCIPAL"],
      },
      {
        title: "Finance",
        url: "/dashboard/school/finance",
        icon: Banknote,
        roles: ["MD", "PRINCIPAL"],
      },
      {
        title: "Student Portal",
        url: "/dashboard/school/student-portal",
        icon: GraduationCap,
        roles: ["STUDENT", "PARENT"],
      },
    ],
  },

  {
    id: 3,
    label: "Legacy",
    devOnly: true,
    items: [
      {
        title: "Dashboards",
        url: "/dashboard/default-v1",
        subItems: [
          { title: "Default V1", url: "/dashboard/default-v1" },
          { title: "CRM V1", url: "/dashboard/crm-v1" },
          { title: "Finance V1", url: "/dashboard/finance-v1" },
          { title: "Analytics V1", url: "/dashboard/analytics-v1" },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "Misc",
    devOnly: true,
    items: [
      {
        title: "Others",
        url: "/dashboard/coming-soon",
        icon: SquareArrowUpRight,
        comingSoon: true,
      },
    ],
  },
];
