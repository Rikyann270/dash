// biome-ignore lint/style/noCommonJs: script file
const fs = require("node:fs");
const seedPath = "/Users/riky/namasuba/dash/supabase/seed.sql";
const newCoursesPath = "/Users/riky/namasuba/dash/supabase/new_courses.sql";

const seed = fs.readFileSync(seedPath, "utf8");
const newCourses = fs.readFileSync(newCoursesPath, "utf8");

// Find the start of the SEED COURSES section
const marker = "-- 5. SEED COURSES";
const idx = seed.indexOf(marker);

if (idx !== -1) {
  // Keep everything before the marker
  const newSeed = `${seed.substring(0, idx)}-- 5. SEED COURSES\n${newCourses}`;
  fs.writeFileSync(seedPath, newSeed);
  console.log("Successfully updated seed.sql");
} else {
  console.log("Marker not found");
}
