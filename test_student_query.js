import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      class_enrollments(
        classes(
          courses(
            id, name, code
          )
        )
      )
    `)
    .limit(1);

  if (error) console.error(error);
  else console.dir(data, { depth: null });
}
void test();
