export type ColumnId = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "MISSED";

export type Column = {
  id: ColumnId;
  title: string;
};

export type TaskPriority = "High" | "Medium" | "Low";

export type TaskInsightLabel = "Present" | "Absent" | "Late";

export type TaskInsight = {
  label: TaskInsightLabel;
  count: number;
};

export type TaskOwnerProfile = {
  name: string;
  tone: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  progress: number;
  owner: TaskOwnerProfile;
  team: string;
  insights: TaskInsight[];
};

export type BoardState = Record<ColumnId, Task[]>;
