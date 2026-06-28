// using node --env-file
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need the service role key to insert into auth without restrictions, or we can just use the anon key for signUp.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedUsers = [
  { email: "md_dev@school.com", role: "MD", first: "Robert", last: "Kavuma" },
  { email: "principal_dev@school.com", role: "PRINCIPAL", first: "Sarah", last: "Nansubuga" },
  { email: "teacher1_dev@school.com", role: "TEACHER", first: "John", last: "Mugisha" },
  { email: "student1_dev@school.com", role: "STUDENT", first: "Alex", last: "Smith" },
  { email: "parent1_dev@school.com", role: "PARENT", first: "Grace", last: "Namaganda" },
];

async function seed() {
  console.log("Seeding remote auth users...");

  for (const u of seedUsers) {
    const { error } = await supabase.auth.signUp({
      email: u.email,
      password: "password123",
      options: {
        data: {
          role: u.role,
          first_name: u.first,
          last_name: u.last,
        },
      },
    });

    if (error) {
      console.log(`Failed for ${u.email}:`, error);
    } else {
      console.log(`Successfully registered ${u.email}`);
    }
  }
}

seed().catch(console.error);
