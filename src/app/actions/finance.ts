"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function getInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fee_invoices")
    .select(`
      *,
      students(
        enrollment_no,
        profiles(first_name, last_name)
      )
    `)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
  return data;
}

export async function recordPayment(invoiceId: string, amount: number) {
  const supabase = await createClient();

  // 1. Fetch the invoice first to see current status
  const { data: invoice, error: fetchError } = await supabase
    .from("fee_invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (fetchError || !invoice) {
    throw new Error("Invoice not found.");
  }

  const newPaid = Number(invoice.amount_paid) + amount;
  const totalDue = Number(invoice.amount_due);
  let status: "PAID" | "PARTIAL" | "UNPAID" = "PARTIAL";

  if (newPaid >= totalDue) {
    status = "PAID";
  } else if (newPaid <= 0) {
    status = "UNPAID";
  }

  const { error } = await supabase
    .from("fee_invoices")
    .update({
      amount_paid: newPaid,
      status: status,
    })
    .eq("id", invoiceId);

  if (error) {
    console.error("Error recording payment:", error);
    throw error;
  }

  revalidatePath("/dashboard/school/finance");
  revalidatePath("/dashboard/school/student-portal");
}

export async function createInvoice(studentId: string, amountDue: number, dueDate: string) {
  const supabase = await createClient();

  if (!studentId || !amountDue || !dueDate) {
    throw new Error("All fields are required to create an invoice.");
  }

  const { error } = await supabase.from("fee_invoices").insert([
    {
      student_id: studentId,
      amount_due: amountDue,
      amount_paid: 0,
      due_date: dueDate,
      status: "UNPAID",
    },
  ]);

  if (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }

  revalidatePath("/dashboard/school/finance");
  revalidatePath("/dashboard/school/student-portal");
}
