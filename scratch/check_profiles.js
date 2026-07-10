// Run using: node --env-file=.env.local scratch/check_profiles.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from("profiles").select("first_name, last_name, email, role");

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles list:");
    console.table(data);
  }
}

check().catch(console.error);
