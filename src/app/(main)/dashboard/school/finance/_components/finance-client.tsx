"use client";

import { useState, useTransition } from "react";

import { AlertTriangle, Banknote, BarChart3, CheckCircle, Plus, Receipt, Search } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { createInvoice, recordPayment } from "@/app/actions/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Student {
  id: string;
  enrollment_no: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Invoice {
  id: string;
  student_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: "PAID" | "PARTIAL" | "UNPAID";
  created_at: string | null;
  students: Student | null;
}

interface FinanceClientProps {
  initialInvoices: Invoice[];
  students: Student[];
}

const chartConfig = {
  billed: {
    label: "Billed ($)",
    color: "var(--chart-1)",
  },
  collected: {
    label: "Collected ($)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function FinanceClient({ initialInvoices, students }: FinanceClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sync state
  useState(() => {
    setInvoices(initialInvoices);
  });

  // Calculations
  const totalBilled = invoices.reduce((acc, curr) => acc + Number(curr.amount_due), 0);
  const totalCollected = invoices.reduce((acc, curr) => acc + Number(curr.amount_paid), 0);
  const totalOutstanding = totalBilled - totalCollected;

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const fullName =
      `${inv.students?.profiles?.first_name || ""} ${inv.students?.profiles?.last_name || ""}`.toLowerCase();
    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      inv.students?.enrollment_no.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === "ALL" || inv.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Chart Data preparation: group by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((m, _idx) => ({ month: m, billed: 0, collected: 0 }));
  invoices.forEach((inv) => {
    const d = new Date(inv.created_at || inv.due_date);
    const mIdx = d.getMonth();
    monthlyData[mIdx].billed += Number(inv.amount_due);
    monthlyData[mIdx].collected += Number(inv.amount_paid);
  });
  // Keep only active months with values
  const activeChartData = monthlyData.filter((d) => d.billed > 0 || d.collected > 0);

  const handleRecordPaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;

    startTransition(async () => {
      try {
        await recordPayment(selectedInvoice.id, parseFloat(paymentAmount));
        toast.success("Payment recorded successfully!");
        setPaymentAmount("");
        setIsPaymentOpen(false);
        setSelectedInvoice(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to record payment.");
      }
    });
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get("studentId") as string;
    const amountDue = parseFloat(formData.get("amountDue") as string);
    const dueDate = formData.get("dueDate") as string;

    startTransition(async () => {
      try {
        await createInvoice(studentId, amountDue, dueDate);
        toast.success("Student invoice generated!");
        setIsInvoiceOpen(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to create invoice.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Total Invoiced</CardTitle>
            <CardAction>
              <Receipt className="size-4 text-muted-foreground" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl tracking-tight">${totalBilled.toFixed(2)}</span>
            <div className="mt-1 text-muted-foreground text-xs">tuition and technical fees billed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Total Collected</CardTitle>
            <CardAction>
              <CheckCircle className="size-4 text-emerald-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl text-emerald-600 tracking-tight dark:text-emerald-400">
              ${totalCollected.toFixed(2)}
            </span>
            <div className="mt-1 text-muted-foreground text-xs">
              {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(0) : 0}% collection rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-muted-foreground text-sm">Outstanding Balances</CardTitle>
            <CardAction>
              <AlertTriangle className="size-4 text-red-500" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <span className="font-bold text-3xl text-red-500 tracking-tight">${totalOutstanding.toFixed(2)}</span>
            <div className="mt-1 text-muted-foreground text-xs">pending student invoice collections</div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 font-bold text-sm">
                <BarChart3 className="h-4 w-4 text-primary" /> Fee Billing vs Collections
              </CardTitle>
              <span className="text-muted-foreground text-xs">Monthly aggregates</span>
            </div>
          </CardHeader>
          <CardContent className="h-70">
            {activeChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded border border-dashed text-muted-foreground text-xs">
                No active billing billing records. Seed data to view chart.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart accessibilityLayer data={activeChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="billed" fill="var(--color-billed)" radius={4} />
                  <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Summary Card */}
        <Card className="flex flex-col justify-between xl:col-span-4">
          <CardHeader>
            <CardTitle className="font-bold text-sm">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Paid Invoices:</span>
              <span className="font-bold">{invoices.filter((i) => i.status === "PAID").length}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Partial Invoices:</span>
              <span className="font-bold">{invoices.filter((i) => i.status === "PARTIAL").length}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Unpaid Invoices:</span>
              <span className="font-bold text-red-500">{invoices.filter((i) => i.status === "UNPAID").length}</span>
            </div>
          </CardContent>
          <div className="flex gap-2 border-t bg-muted/20 p-4">
            {/* Create Invoice Dialog */}
            <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Generate Fee Invoice</DialogTitle>
                    <DialogDescription>Bill a student for tuition or structural courses.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Select Student</Label>
                    <NativeSelect id="studentId" name="studentId" required>
                      <option value="">-- Choose Student --</option>
                      {students.map((std) => (
                        <option key={std.id} value={std.id}>
                          {std.profiles?.first_name} {std.profiles?.last_name} ({std.enrollment_no})
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amountDue">Amount Due ($)</Label>
                    <Input
                      id="amountDue"
                      name="amountDue"
                      type="number"
                      required
                      placeholder="1500.00"
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" required />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInvoiceOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Generating..." : "Create Invoice"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-bold text-base">Ledger Transactions</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search ledger..."
                className="h-8 pl-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <NativeSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 w-[120px] text-xs"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </NativeSelect>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => {
              const balance = Number(inv.amount_due) - Number(inv.amount_paid);
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    <div className="font-bold text-foreground">
                      {inv.students?.profiles?.first_name} {inv.students?.profiles?.last_name}
                    </div>
                    <div className="font-mono text-muted-foreground text-xs">{inv.students?.enrollment_no}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">${Number(inv.amount_due).toFixed(2)}</TableCell>
                  <TableCell className="text-emerald-600 dark:text-emerald-400">
                    ${Number(inv.amount_paid).toFixed(2)}
                  </TableCell>
                  <TableCell className={balance > 0 ? "font-semibold text-red-500" : "font-mono text-muted-foreground"}>
                    ${balance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === "PAID" ? "default" : inv.status === "PARTIAL" ? "secondary" : "destructive"
                      }
                      className="rounded-sm text-[10px]"
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {inv.status !== "PAID" ? (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsPaymentOpen(true);
                        }}
                      >
                        <Banknote className="mr-1 h-3 w-3" /> Pay
                      </Button>
                    ) : (
                      <span className="pr-2 text-muted-foreground text-xs italic">Cleared</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={(open) => !open && setIsPaymentOpen(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Post manual payment to the student's ledger.</DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-2 rounded bg-muted/30 p-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-bold">
                    {selectedInvoice.students?.profiles?.first_name} {selectedInvoice.students?.profiles?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Billed:</span>
                  <span>${Number(selectedInvoice.amount_due).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ${Number(selectedInvoice.amount_paid).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-semibold">
                  <span className="text-muted-foreground">Pending Balance:</span>
                  <span className="text-red-500">
                    ${(Number(selectedInvoice.amount_due) - Number(selectedInvoice.amount_paid)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount to Pay ($)</Label>
              <Input
                id="paymentAmount"
                name="paymentAmount"
                type="number"
                required
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Posting..." : "Post Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
