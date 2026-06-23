import { getInvoices } from "@/app/actions/finance";
import { getStudents } from "@/app/actions/students";
import { FinanceClient } from "./_components/finance-client";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const [invoices, students] = await Promise.all([
    getInvoices(),
    getStudents()
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
        <p className="text-muted-foreground">Manage student fee invoices, ledger transactions, and collections.</p>
      </div>
      <FinanceClient 
        initialInvoices={invoices as any} 
        students={students as any} 
      />
    </div>
  );
}

