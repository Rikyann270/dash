"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function switchDevUser(email: string) {
  if (process.env.NODE_ENV !== "development") return;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: "password123",
  });

  if (error) {
    console.error("Error switching dev user:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/school");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/v1/login");
}
