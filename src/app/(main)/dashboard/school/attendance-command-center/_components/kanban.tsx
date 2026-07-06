"use client";

import * as React from "react";

import {
  ArrowUpDown,
  ChevronDown,
  Kanban as KanbanIcon,
  LayoutTemplate,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { columns } from "./data";
import { KanbanColumn } from "./kanban-column";
import type { BoardState, ColumnId } from "./types";

interface KanbanProps {
  board: BoardState;
}

export function Kanban({ board }: KanbanProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Search logic
  const filteredBoard = React.useMemo(() => {
    if (!searchTerm.trim()) return board;
    const lowerSearch = searchTerm.toLowerCase();

    const result: Partial<BoardState> = {};
    for (const colId of Object.keys(board) as ColumnId[]) {
      result[colId] = board[colId].filter(
        (t) =>
          t.title.toLowerCase().includes(lowerSearch) ||
          t.owner.name.toLowerCase().includes(lowerSearch) ||
          t.team.toLowerCase().includes(lowerSearch),
      );
    }
    return result as BoardState;
  }, [board, searchTerm]);

  return (
    <div className="flex h-[calc(100dvh-var(--dashboard-header-height))] min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      {/* Header controls matching /dashboard/kanban exactly */}
      <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <Tabs defaultValue="board" className="min-w-0">
          <TabsList className="w-full *:data-[slot=tabs-trigger]:flex-1 sm:w-fit sm:*:data-[slot=tabs-trigger]:flex-none">
            <TabsTrigger value="board" className="gap-2">
              <KanbanIcon className="size-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2" disabled>
              <List className="size-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2" disabled>
              <Table2 className="size-4" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center 2xl:justify-end">
          <InputGroup className="min-w-0 sm:w-64 2xl:w-48">
            <InputGroupInput
              type="search"
              placeholder="Search session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
          </InputGroup>
          <Button variant="outline" className="w-full sm:w-auto">
            <SlidersHorizontal className="size-4" data-icon="inline-start" />
            Filter
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowUpDown className="size-4" data-icon="inline-start" />
            Sort
          </Button>
          <ButtonGroup className="w-full sm:w-fit">
            <Button className="flex-1 sm:flex-none">
              <Plus className="size-4" data-icon="inline-start" />
              Add Session
            </Button>
            <ButtonGroupSeparator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Open add options menu">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <LayoutTemplate className="size-4" />
                  Import Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </div>

      {/* Grid container matching /dashboard/kanban layout */}
      <div className="scrollbar-thin min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden bg-muted/25 px-4 pt-4 pb-0 [scrollbar-color:var(--border)_transparent] lg:px-5 lg:pt-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1">
        <div className="inline-grid h-full min-w-full grid-cols-[repeat(4,minmax(20rem,1fr))] gap-4">
          {columns.map((column) => (
            <KanbanColumn key={column.id} column={column} tasks={filteredBoard[column.id] || []} />
          ))}
        </div>
      </div>
    </div>
  );
}
