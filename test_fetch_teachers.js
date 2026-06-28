// using node --env-file
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("teachers")
    .select("*, profiles(first_name, last_name, email)")
    .limit(1)
    .single();

  console.log("Data:", data);
  console.log("Error:", error);
}

test().catch(console.error);
